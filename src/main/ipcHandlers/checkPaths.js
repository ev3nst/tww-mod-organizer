import { ipcMain } from 'electron';
import path from 'path';

import db from '../db';
import dbKeys from '../db/keys';
import fs from 'fs';
import supportedGames from '../../store/supportedGames';

export default function checkPaths() {
    ipcMain.handle('checkPaths', async () => {
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const dbGameInstallPaths = db.get(dbKeys.GAME_INSTALL_PATHS);

        if (
            typeof managedGame !== 'undefined' &&
            managedGame !== null &&
            typeof dbGameInstallPaths !== 'undefined' &&
            dbGameInstallPaths !== null &&
            typeof dbGameInstallPaths[managedGame] !== 'undefined' &&
            dbGameInstallPaths[managedGame] !== null
        ) {
            const managedGameDetails = supportedGames.filter(
                (sgf) => sgf.slug === managedGame,
            )[0];
            if (
                fs.existsSync(
                    path.join(
                        dbGameInstallPaths[managedGame],
                        `${managedGameDetails.exeName}.exe`,
                    ),
                )
            ) {
                return dbGameInstallPaths;
            }
        }

        return null;
    });
}
