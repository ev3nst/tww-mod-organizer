import { app, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';

import dbKeys from '../db/keys';
import db from '../db';
import { getModFiles } from './gameModFiles';

export default async function gameModOrder(profileName = 'default') {
    ipcMain.handle('game:modOrder', async () => {
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const modOrderProfilePath = path.join(
            app.getPath('userData'),
            'profiles',
            managedGame,
        );

        const profileFileName = `${profileName}.txt`;
        const profileFilePath = path.join(modOrderProfilePath, profileFileName);
        if (!fs.existsSync(profileFilePath)) {
            mkdripSync(modOrderProfilePath);

            const modFiles = await getModFiles();
            const defaultOrder = modFiles.map((mf) => mf.id);
            fs.writeFileSync(
                path.join(modOrderProfilePath, profileFileName),
                JSON.stringify(defaultOrder),
            );

            return defaultOrder;
        } else {
            try {
                const loadOrderRaw = fs.readFileSync(profileFilePath, 'utf-8');
                const loadOrder = JSON.parse(loadOrderRaw);
                return loadOrder;
            } catch (e) {
                console.warn(e);
                dialog.showErrorBox(
                    'Load Order File Corrupt',
                    'App could not read load order file. You can manually delete the file at: ' +
                        profileFilePath,
                );
            }
        }
    });
}
