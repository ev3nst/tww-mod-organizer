import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';
import { readdir } from 'fs/promises';
import workerpool from 'workerpool';

import db from '../db';
import dbKeys from '../db/keys';
import supportedGames from '../../store/supportedGames';
import { resolveModInstallationPath } from '../tools/resolveManagedPaths';

const TWENTY_MINUTES = 60 * 20 * 1000;
let readPackWorkerPath = path.resolve(
    __dirname,
    '../../../workers/pack-file-manager/pack-file.worker.js',
);
let findCollisionsWorkerPath = path.resolve(
    __dirname,
    '../../../workers/pack-file-manager/find-collisions.worker.js',
);

if (app.isPackaged) {
    const workerJsPath = path.resolve(
        __dirname,
        '../../../app/dist/main/worker.js',
    );

    readPackWorkerPath = workerJsPath;
    findCollisionsWorkerPath = workerJsPath;
}

const readPackPool = workerpool.pool(readPackWorkerPath, {
    workerType: 'thread',
    maxWorkers: 3,
});

const findCollisionPool = workerpool.pool(findCollisionsWorkerPath, {
    workerType: 'thread',
    maxWorkers: 3,
});

export default function getModConflicts() {
    ipcMain.handle('getModConflicts', async (_e, forceClearCache = false) => {
        const tenMinutesAgo = Date.now() - TWENTY_MINUTES;
        const isAlreadyRunning = db.get(dbKeys.PACK_CONFLICT_RESOLVER_STATE);
        const packConflictResolveTimestamp = db.get(
            dbKeys.PACK_CONFLICT_RESOLVER_TIMESTAMP,
        );

        const isNotExpired =
            typeof packConflictResolveTimestamp !== 'undefined' &&
            packConflictResolveTimestamp !== null &&
            packConflictResolveTimestamp > tenMinutesAgo;
        if (forceClearCache === false && isNotExpired && isAlreadyRunning) {
            return null;
        }

        if (forceClearCache === true) {
            db.set(dbKeys.PACK_CONFLICT_RESOLVER_TIMESTAMP, null);
            db.set(dbKeys.PACK_CONFLICT_RESOLVER_DATA, null);
        } else {
            if (
                typeof packConflictResolveTimestamp !== 'undefined' &&
                packConflictResolveTimestamp !== null
            ) {
                if (packConflictResolveTimestamp > tenMinutesAgo) {
                    const packConflictResolveData = db.get(
                        dbKeys.PACK_CONFLICT_RESOLVER_DATA,
                    );

                    return packConflictResolveData;
                }
            }
        }

        db.set(dbKeys.PACK_CONFLICT_RESOLVER_STATE, true);
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const managedGameDetails = supportedGames.filter(
            (sgf) => sgf.slug === managedGame,
        )[0];
        const gameInstallationPaths = db.get(dbKeys.GAME_INSTALL_PATHS);
        const workshopContentPath = path.resolve(
            gameInstallationPaths[managedGame],
            '../../workshop/content/' + managedGameDetails.steamId,
        );
        const packFilePaths = [];
        const steamModDirectories = (
            await readdir(workshopContentPath, { withFileTypes: true })
        )
            .filter((dirent) => dirent.isDirectory())
            .map((dir) => dir.name);

        for (let di = 0; di < steamModDirectories.length; di++) {
            const modSteamIdDirectory = steamModDirectories[di];
            const modContentPath = path.join(
                workshopContentPath,
                modSteamIdDirectory,
            );

            const modContents = fs.readdirSync(modContentPath);
            for (let mci = 0; mci < modContents.length; mci++) {
                const modContent = modContents[mci];
                if (modContent.endsWith('.pack')) {
                    packFilePaths.push(path.join(modContentPath, modContent));
                    break;
                }
            }
        }

        const modInstallationFolder = resolveModInstallationPath();
        const gameSpecificModInstallFolder = path.join(
            modInstallationFolder,
            managedGame,
        );

        if (!fs.existsSync(gameSpecificModInstallFolder)) {
            mkdripSync(gameSpecificModInstallFolder);
        }

        const manualModDirectories = (
            await readdir(gameSpecificModInstallFolder, { withFileTypes: true })
        )
            .filter((dirent) => dirent.isDirectory())
            .map((dir) => dir.name);

        for (let di = 0; di < manualModDirectories.length; di++) {
            const manualModDirectory = manualModDirectories[di];
            const modContentPath = path.join(
                gameSpecificModInstallFolder,
                manualModDirectory,
            );

            const modContents = fs.readdirSync(modContentPath);
            for (let mci = 0; mci < modContents.length; mci++) {
                const modContent = modContents[mci];
                if (modContent.endsWith('.pack')) {
                    packFilePaths.push(path.join(modContentPath, modContent));
                    break;
                }
            }
        }

        const packFileContents = [];
        for (let pfpi = 0; pfpi < packFilePaths.length; pfpi++) {
            const packFilePath = packFilePaths[pfpi];
            const packContent = await readPackPool.exec('readPack', [
                packFilePath,
                path.basename(packFilePath),
                { skipParsingTables: false },
                managedGameDetails.schemaName,
            ]);

            packFileContents.push(packContent);
        }

        const collisions = await findCollisionPool.exec(
            'findPackFileCollisions',
            [packFileContents],
        );

        db.set(dbKeys.PACK_CONFLICT_RESOLVER_DATA, collisions);
        db.set(dbKeys.PACK_CONFLICT_RESOLVER_STATE, false);
        db.set(dbKeys.PACK_CONFLICT_RESOLVER_TIMESTAMP, new Date().getTime());
        return collisions;
    });
}
