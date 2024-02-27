import { app, dialog, ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';

import dbKeys from '../db/keys';
import db from '../db';
import { resolveModInstallationPath } from '../tools/resolveManagedPaths';

export default function deleteMod() {
    ipcMain.handle('deleteMod', async (_e, modDetails) => {
        const modInstallationFolder = resolveModInstallationPath();
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const modPath = path.join(
            modInstallationFolder,
            managedGame,
            modDetails.title,
        );

        if (fs.existsSync(modPath)) {
            await shell.trashItem(modPath);
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

            return true;
        } else {
            dialog.showErrorBox(
                'Delete Mod',
                'Expected mod folder was not found at :' + modPath,
            );
            return false;
        }
    });
}
