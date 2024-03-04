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
    ipcMain.handle('getModConflicts', async () => {
        const tenMinutesAgo = Date.now() - TWENTY_MINUTES;
        const isAlreadyRunning = db.get(dbKeys.PACK_CONFLICT_RESOLVER_STATE);
        const packConflictResolveTimestamp = db.get(
            dbKeys.PACK_CONFLICT_RESOLVER_TIMESTAMP,
        );

        const isNotExpired =
            typeof packConflictResolveTimestamp !== 'undefined' &&
            packConflictResolveTimestamp !== null &&
            packConflictResolveTimestamp > tenMinutesAgo;
        if (isNotExpired && isAlreadyRunning) {
            return null;
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
        const packFilePaths = {};
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
                    const packFilePath = path.join(modContentPath, modContent);
                    packFilePaths[packFilePath] = {
                        size: fs.lstatSync(packFilePath).size,
                        name: path.basename(packFilePath),
                    };
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
                    const packFilePath = path.join(modContentPath, modContent);
                    packFilePaths[packFilePath] = {
                        size: fs.lstatSync(packFilePath).size,
                        name: path.basename(packFilePath),
                    };
                    break;
                }
            }
        }

        const dbPackFileStats = db.get(dbKeys.PACK_FILE_STATS);
        db.set(dbKeys.PACK_FILE_STATS, packFilePaths);

        const packFileContents = [];
        for (const packFilePath in packFilePaths) {
            const packContent = await readPackPool.exec('readPack', [
                packFilePath,
                path.basename(packFilePath),
                { skipParsingTables: false },
                managedGameDetails.schemaName,
            ]);

            packContent.packFileSize = packFilePaths[packFilePath].size;
            packFileContents.push(packContent);
        }

        let conflicts = db.get(dbKeys.PACK_CONFLICT_RESOLVER_DATA);
        if (typeof conflicts !== 'object' || conflicts === null) {
            conflicts = {};
        }

        for (let i = 0; i < packFileContents.length; i++) {
            const pack = packFileContents[i];

            if (typeof conflicts[pack.name] === 'undefined') {
                conflicts[pack.name] = {};
            }

            for (let j = i + 1; j < packFileContents.length; j++) {
                const packTwo = packFileContents[j];

                if (typeof conflicts[packTwo.name] === 'undefined') {
                    conflicts[packTwo.name] = {};
                }

                if (pack === packTwo) continue;
                if (pack.name === packTwo.name) continue;
                if (pack.name === 'data.pack' || packTwo.name === 'data.pack')
                    continue;

                if (
                    typeof dbPackFileStats[pack.path] !== 'undefined' &&
                    typeof dbPackFileStats[packTwo.path] !== 'undefined' &&
                    dbPackFileStats[pack.path].size === pack.packFileSize &&
                    dbPackFileStats[packTwo.path].size ===
                        packTwo.packFileSize &&
                    typeof conflicts[pack.name][packTwo.name] !== 'undefined' &&
                    typeof conflicts[packTwo.name][pack.name] !== 'undefined'
                ) {
                    continue;
                }

                const packCollisions = await findCollisionPool.exec(
                    'findPackFileCollisions',
                    [pack, packTwo],
                );

                if (typeof packCollisions[pack.name] !== 'undefined') {
                    conflicts[pack.name][packTwo.name] = [
                        ...(conflicts[pack.name][packTwo.name] || []),
                        ...packCollisions[pack.name][packTwo.name],
                    ];

                    conflicts[packTwo.name][pack.name] = [
                        ...(conflicts[packTwo.name][pack.name] || []),
                        ...packCollisions[packTwo.name][pack.name],
                    ];
                } else {
                    conflicts[pack.name][packTwo.name] = [];
                    conflicts[packTwo.name][pack.name] = [];
                }
            }
        }

        db.set(dbKeys.PACK_CONFLICT_RESOLVER_DATA, conflicts);
        db.set(dbKeys.PACK_CONFLICT_RESOLVER_STATE, false);
        db.set(dbKeys.PACK_CONFLICT_RESOLVER_TIMESTAMP, new Date().getTime());

        let parsedConflicts = {};
        for (const packConflictName in conflicts) {
            if (typeof parsedConflicts[packConflictName] === 'undefined') {
                parsedConflicts[packConflictName] = {};
            }

            for (const packTwoConflictName in conflicts[packConflictName]) {
                const conflictedFileNames =
                    conflicts[packConflictName][packTwoConflictName];
                for (let cf = 0; cf < conflictedFileNames.length; cf++) {
                    const conflictedFileName = conflictedFileNames[cf];
                    if (
                        typeof parsedConflicts[packConflictName][
                            conflictedFileName
                        ] === 'undefined'
                    ) {
                        parsedConflicts[packConflictName][conflictedFileName] =
                            [];
                    }

                    parsedConflicts[packConflictName][conflictedFileName].push(
                        packTwoConflictName,
                    );
                }
            }
        }

        return parsedConflicts;
    });
}
