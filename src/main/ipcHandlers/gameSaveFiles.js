import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

import db from '../db';
import dbKeys from '../db/keys';

import { resolveSaveGamePaths } from '../tools/steam';

export default function gameSaveFiles() {
    ipcMain.handle('game:saveFiles', (managedGameFallback) => {
        let managedGame = db.get(dbKeys.MANAGED_GAME);
        if (!managedGame) {
            managedGame = managedGameFallback;
        }

        let saveGamePaths = db.get(dbKeys.SAVE_GAME_PATHS);
        if (saveGamePaths.length === 0) {
            saveGamePaths = resolveSaveGamePaths();
        }

        let saveGameFiles = [];
        if (typeof saveGamePaths[managedGame] !== 'undefined') {
            const saveGamePath = saveGamePaths[managedGame];
            if (!fs.existsSync(saveGamePath)) {
                return [];
            }

            const files = fs.readdirSync(saveGamePath);
            for (let fi = 0; fi < files.length; fi++) {
                const filePath = path.join(saveGamePath, files[fi]);
                if (filePath.endsWith('.save')) {
                    const stat = fs.lstatSync(filePath);
                    saveGameFiles.push({
                        name: files[fi],
                        size: stat.size,
                        date: stat.mtime,
                        path: filePath,
                    });
                }
            }
        }

        return saveGameFiles;
    });
}
