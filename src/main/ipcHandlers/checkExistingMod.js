import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
// eslint-disable-next-line no-unused-vars
import { readdir } from 'fs/promises';

import db from '../db';
import dbKeys from '../db/keys';
// eslint-disable-next-line no-unused-vars
import supportedGames from '../../store/supportedGames';
import { resolveModInstallationPath } from '../tools/resolveManagedPaths';

export default function checkExistingMod() {
    ipcMain.handle('checkExistingMod', async (_e, modName) => {
        const managedGame = db.get(dbKeys.MANAGED_GAME);
        const modInstallationFolder = resolveModInstallationPath();
        const modInstallationPath = path.join(
            modInstallationFolder,
            managedGame,
        );
        const checkModInstallationPath = path.join(
            modInstallationPath,
            modName,
        );
        const folderExists = fs.existsSync(checkModInstallationPath);
        return folderExists;

        // Check same pack file exists ?
        /*
        const managedGameDetails = supportedGames.filter(
            (sgf) => sgf.slug === managedGame,
        )[0];
        const gameInstallationPaths = db.get(dbKeys.GAME_INSTALL_PATHS);
        const workshopContentPath = path.resolve(
            gameInstallationPaths[managedGame],
            '../../workshop/content/' + managedGameDetails.steamId,
        );

        let packFileExists = false;
        const steamPackFiles = (
            await readdir(workshopContentPath, { withFileTypes: true })
        ).filter((dirent) => dirent.name.endsWith('.pack'));
        if (steamPackFiles.length > 0) {
            packFileExists = true;
            return {
                folderExists,
                packFileExists,
            };
        }

        const manualPackFiles = (
            await readdir(modInstallationPath, { withFileTypes: true })
        ).filter((dirent) => dirent.name.endsWith('.pack'));

        if (manualPackFiles.length > 0) {
            packFileExists = true;
        }

        return {
            folderExists,
            packFileExists,
        };
        */
    });
}
