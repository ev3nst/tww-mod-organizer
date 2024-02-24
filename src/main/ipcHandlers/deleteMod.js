import { app, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';

import dbKeys from '../db/keys';
import db from '../db';
import { resolveModInstallationPath } from '../tools/resolveManagedPaths';

export default function deleteMod() {
    ipcMain.handle('deleteMod', async (_e, modDetails) => {
        const modInstallationFolder = resolveModInstallationPath();
        const modPath = path.join(modInstallationFolder, modDetails.title);
        if (fs.existsSync(modPath)) {
            await shell.trashItem(modPath);

            const managedGame = db.get(dbKeys.MANAGED_GAME);
            const modProfilePath = path.join(
                app.getPath('userData'),
                'profiles',
                managedGame,
            );

            const files = fs.readdirSync(modProfilePath);
            for (let fi = 0; fi < files.length; fi++) {
                const profileFileName = files[fi];
                const profileFilePath = path.join(
                    modProfilePath,
                    profileFileName,
                );
                if (profileFilePath.endsWith('.txt')) {
                    const loadProfileDataRaw = fs.readFileSync(
                        profileFilePath,
                        'utf-8',
                    );
                    const loadProfileData = JSON.parse(loadProfileDataRaw);
                    const loadProfileDataResolved = [];
                    for (let lpdi = 0; lpdi < loadProfileData.length; lpdi++) {
                        const row = loadProfileData[lpdi];
                        if (modDetails.id !== row.id) {
                            loadProfileDataResolved.push(row);
                        }
                    }

                    fs.writeFileSync(
                        profileFilePath,
                        JSON.stringify(loadProfileDataResolved),
                    );
                }
            }
        }
    });
}
