import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';

import { db } from '../db';
import dbKeys from '../db/keys';

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

            const profileFileName = `${profileName}.json`;
            const profileFilePath = path.join(modProfilePath, profileFileName);
            if (!fs.existsSync(modProfilePath)) {
                mkdripSync(modProfilePath);
            }

            fs.writeFileSync(profileFilePath, JSON.stringify(modProfileData));
            db.set(dbKeys.MOD_PROFILE, profileName);
        },
    );
}
