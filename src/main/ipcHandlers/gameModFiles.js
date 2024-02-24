import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { readdir } from 'fs/promises';
import { ulid } from 'ulid';

import { getWorkshopMods } from '../tools/steam';
import { getModInstallationPath } from '../tools/resolveManagedPaths';

export async function getModFiles() {
    const steamWorkshopMods = await getWorkshopMods();
    let manuallyInstalledMods = [];
    const modInstallationFolder = getModInstallationPath();
    const directories = (
        await readdir(modInstallationFolder, { withFileTypes: true })
    )
        .filter((dirent) => dirent.isDirectory())
        .map((dir) => dir.name);

    for (let di = 0; di < directories.length; di++) {
        const dir = directories[di];
        const metaDataPath = path.join(
            modInstallationFolder,
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
            try {
                modMeta = JSON.parse(modMetaTextData);
            } catch (e) {
                console.warn(e);
            }

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

export default async function gameModFiles() {
    ipcMain.handle('game:modFiles', async () => {
        return await getModFiles();
    });
}
