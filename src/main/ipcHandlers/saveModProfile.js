import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';

import dbKeys from '../db/keys';
import { db } from '../db';

export default async function saveModProfile() {
    ipcMain.handle(
        'saveModProfile',
        async (_e, profileName = 'default', newProfileData) => {
            const managedGame = db.get(dbKeys.MANAGED_GAME);
            const modProfilePath = path.join(
                app.getPath('userData'),
                'profiles',
                managedGame,
            );

            const profileFileName = `${profileName}.json`;
            const profileFilePath = path.join(modProfilePath, profileFileName);
            if (!fs.existsSync(profileFilePath)) {
                mkdripSync(modProfilePath);
            }

            fs.writeFileSync(profileFilePath, JSON.stringify(newProfileData));
        },
    );
}
