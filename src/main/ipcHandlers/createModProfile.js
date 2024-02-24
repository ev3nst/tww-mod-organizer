import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';

import dbKeys from '../db/keys';
import db from '../db';

export default async function createModProfile() {
    ipcMain.handle(
        'createModProfile',
        async (_e, profileName, modProfileData) => {
            const managedGame = db.get(dbKeys.MANAGED_GAME);
            const modProfilePath = path.join(
                app.getPath('userData'),
                'profiles',
                managedGame,
            );

            const profileFileName = `${profileName}.txt`;
            const profileFilePath = path.join(modProfilePath, profileFileName);
            if (!fs.existsSync(profileFilePath)) {
                mkdripSync(modProfilePath);
            }

            fs.writeFileSync(
                path.join(modProfilePath, profileFileName),
                JSON.stringify(modProfileData),
            );

            db.set(dbKeys.MOD_PROFILE, profileName);
        },
    );
}
