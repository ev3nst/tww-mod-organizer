import { app, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';

import dbKeys from '../db/keys';
import db from '../db';
import { retrieveModFiles } from './getModFiles';

export default async function getModProfile() {
    ipcMain.handle('getModProfile', async (_e, profileName = 'default') => {
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const modProfilePath = path.join(
            app.getPath('userData'),
            'profiles',
            managedGame,
        );

        let profileFileName = `${profileName}.txt`;
        const profileFilePath = path.join(modProfilePath, profileFileName);
        const modFiles = await retrieveModFiles();
        if (!fs.existsSync(profileFilePath)) {
            mkdripSync(modProfilePath);

            const defaultProfileData = modFiles.map((mf) => {
                return { id: mf.id, active: true };
            });
            fs.writeFileSync(
                path.join(modProfilePath, profileFileName),
                JSON.stringify(defaultProfileData),
            );

            return defaultProfileData;
        } else {
            try {
                const loadProfileDataRaw = fs.readFileSync(
                    profileFilePath,
                    'utf-8',
                );
                const loadProfileData = JSON.parse(loadProfileDataRaw);
                const loadProfileDataResolved = [];
                let rewriteLoadOrder = false;
                for (let lpdi = 0; lpdi < loadProfileData.length; lpdi++) {
                    const row = loadProfileData[lpdi];
                    if (modFiles.findIndex((v) => v.id === row.id) !== -1) {
                        loadProfileDataResolved.push(row);
                        rewriteLoadOrder = true;
                    }
                }

                if (rewriteLoadOrder) {
                    fs.writeFileSync(
                        path.join(modProfilePath, profileFileName),
                        JSON.stringify(loadProfileDataResolved),
                    );
                }
                return loadProfileDataResolved;
            } catch (e) {
                console.warn(e);
                dialog.showErrorBox(
                    'Mod Profile File Corrupt',
                    'App could not read mod profile file. You can manually delete the file at: ' +
                        profileFilePath,
                );
            }
        }
    });
}
