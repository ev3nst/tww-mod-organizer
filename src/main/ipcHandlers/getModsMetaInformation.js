import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { readdir } from 'fs/promises';
import { sync as mkdripSync } from 'mkdirp';
import { ulid } from 'ulid';

import db from '../db';
import dbKeys from '../db/keys';
import { getWorkshopMods } from '../tools/steam';
import { resolveModInstallationPath } from '../tools/resolveManagedPaths';

export async function retrieveModsMetaInformation() {
    const managedGame = db.get(dbKeys.MANAGED_GAME);
    const steamWorkshopMods = await getWorkshopMods();
    let manuallyInstalledMods = [];
    const modInstallationFolder = resolveModInstallationPath();
    const gameSpecificModInstallFolder = path.join(
        modInstallationFolder,
        managedGame,
    );

    if (!fs.existsSync(gameSpecificModInstallFolder)) {
        mkdripSync(gameSpecificModInstallFolder);
    }

    const directories = (
        await readdir(gameSpecificModInstallFolder, { withFileTypes: true })
    )
        .filter((dirent) => dirent.isDirectory())
        .map((dir) => dir.name);

    for (let di = 0; di < directories.length; di++) {
        const dir = directories[di];
        const metaDataPath = path.join(
            gameSpecificModInstallFolder,
            dir,
            'tww-mod-organizer.meta',
        );
        const blankNewMeta = {
            id: ulid(),
            title: dir,
            version: '1.0',
        };
        if (!fs.existsSync(metaDataPath)) {
            manuallyInstalledMods.push(blankNewMeta);
            fs.writeFileSync(metaDataPath, JSON.stringify(blankNewMeta));
        } else {
            const modMetaTextData = fs.readFileSync(metaDataPath, 'utf8');
            let modMeta;
            modMeta = JSON.parse(modMetaTextData);

            if (!modMeta) {
                manuallyInstalledMods.push(blankNewMeta);
                fs.writeFileSync(metaDataPath, JSON.stringify(blankNewMeta));
            } else {
                manuallyInstalledMods.push(modMeta);
            }
        }
    }

    const modFiles = [...steamWorkshopMods, ...manuallyInstalledMods];
    return modFiles;
}

export default async function getModsMetaInformation() {
    ipcMain.handle('getModsMetaInformation', async () => {
        return await retrieveModsMetaInformation();
    });
}
