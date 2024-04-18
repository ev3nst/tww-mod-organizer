import { ipcMain } from 'electron';
import path from 'path';

import { db } from '../db';
import dbKeys from '../db/keys';
import fs from 'fs';
import supportedGames from '../../store/supportedGames';

export default function checkPaths() {
    ipcMain.handle('checkPaths', async () => {
        const dbGameInstallPaths = db.get(dbKeys.GAME_INSTALL_PATHS);
        const resolvedInstallPaths = {};
        if (
            typeof dbGameInstallPaths !== 'undefined' &&
            dbGameInstallPaths !== null
        ) {
            const dgiKeys = Object.keys(dbGameInstallPaths);
            for (let dgi = 0; dgi < dgiKeys.length; dgi++) {
                const gameKey = dgiKeys[dgi];
                const gamePath = dbGameInstallPaths[gameKey];
                const gameDetails = supportedGames.filter(
                    (sgf) => sgf.slug === gameKey,
                )[0];

                const exePath = path.join(
                    gamePath,
                    `${gameDetails.exeName}.exe`,
                );

                if (fs.existsSync(exePath)) {
                    resolvedInstallPaths[gameKey] = gamePath;
                } else {
                    resolvedInstallPaths[gameKey] = '';
                }
            }

            db.set(dbKeys.GAME_INSTALL_PATHS, resolvedInstallPaths);
            return resolvedInstallPaths;
        } else {
            return dbGameInstallPaths;
        }
    });
}
