import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

import { getModInstallationPath } from '../tools/resolveManagedPaths';

export default function gameCheckExistingMod() {
    ipcMain.handle('game:checkExistingMod', (_e, modName) => {
        const modInstallationFolder = getModInstallationPath();
        const modInstallationPath = path.join(modInstallationFolder, modName);
        return fs.existsSync(modInstallationPath);
    });
}