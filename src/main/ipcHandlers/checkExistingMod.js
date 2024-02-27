import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

import db from '../db';
import dbKeys from '../db/keys';
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
    });
}
