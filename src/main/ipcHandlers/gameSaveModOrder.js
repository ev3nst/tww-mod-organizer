import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { sync as mkdripSync } from 'mkdirp';

import dbKeys from '../db/keys';
import db from '../db';

export default async function gameSaveModOrder() {
    ipcMain.handle(
        'game:saveModOrder',
        async (_e, newOrder, profileName = 'default') => {
            const managedGame = db.get(dbKeys.MANAGED_GAME);
            const modOrderProfilePath = path.join(
                app.getPath('userData'),
                'profiles',
                managedGame,
            );

            const profileFileName = `${profileName}.txt`;
            const profileFilePath = path.join(
                modOrderProfilePath,
                profileFileName,
            );
            if (!fs.existsSync(profileFilePath)) {
                mkdripSync(modOrderProfilePath);
            }

            fs.writeFileSync(
                path.join(modOrderProfilePath, profileFileName),
                JSON.stringify(newOrder),
            );
        },
    );
}
