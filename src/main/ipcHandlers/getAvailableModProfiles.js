import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

import db from '../db';
import dbKeys from '../db/keys';

export default async function getAvailableModProfiles() {
    ipcMain.handle('getAvailableModProfiles', async () => {
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const modProfilePath = path.join(
            app.getPath('userData'),
            'profiles',
            managedGame,
        );

        const availableModProfiles = [];
        const files = fs.readdirSync(modProfilePath);
        for (let fi = 0; fi < files.length; fi++) {
            const filePath = path.join(modProfilePath, files[fi]);
            if (filePath.endsWith('.txt')) {
                availableModProfiles.push(files[fi]);
            }
        }

        return availableModProfiles;
    });
}
