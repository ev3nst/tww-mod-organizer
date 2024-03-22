import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

import dbKeys from '../db/keys';
import db from '../db';

export default async function setActiveMods() {
    ipcMain.handle('setActiveMods', async (_e, modIds) => {
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const modProfilePath = path.join(
            app.getPath('userData'),
            'profiles',
            managedGame,
        );

        const profileName = db.get(dbKeys.MOD_PROFILE) || 'default';
        const profileFileName = `${profileName}.json`;
        const profileFilePath = path.join(modProfilePath, profileFileName);
        const loadProfileDataRaw = fs.readFileSync(profileFilePath, 'utf-8');
        const loadProfileData = JSON.parse(loadProfileDataRaw);
        const loadProfileDataResolved = [];
        for (let lpdi = 0; lpdi < loadProfileData.length; lpdi++) {
            const row = loadProfileData[lpdi];
            loadProfileDataResolved.push({
                ...row,
                active: modIds.includes(row.id),
            });
        }

        fs.writeFileSync(
            profileFilePath,
            JSON.stringify(loadProfileDataResolved),
        );

        return loadProfileDataResolved;
    });
}
