import { app, ipcMain, shell } from 'electron';
import path from 'path';

import dbKeys from '../db/keys';
import db from '../db';

export default async function deleteModProfile() {
    ipcMain.handle('deleteModProfile', async (_e, profileName) => {
        if (profileName === 'default') {
            return;
        }

        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const modProfilePath = path.join(
            app.getPath('userData'),
            'profiles',
            managedGame,
        );

        const profileFileName = `${profileName}.txt`;
        const profileFilePath = path.join(modProfilePath, profileFileName);
        await shell.trashItem(profileFilePath);
    });
}
