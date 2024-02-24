import { ipcMain, shell } from 'electron';
import path from 'path';

import db from '../db';
import dbKeys from '../db/keys';

export default function deleteSaveFiles() {
    ipcMain.handle('deleteSaveFiles', async (_e, saveFilePaths) => {
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const saveGamePaths = db.get(dbKeys.SAVE_GAME_PATHS);
        for (let sfpi = 0; sfpi < saveFilePaths.length; sfpi++) {
            const saveFilePath = saveFilePaths[sfpi];
            if (!saveFilePath.endsWith('.save')) {
                return;
            }

            await shell.trashItem(
                path.join(saveGamePaths[managedGame], saveFilePath),
            );
        }
    });
}
