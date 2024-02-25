import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

import { resolveModInstallationPath } from '../tools/resolveManagedPaths';

export default function checkExistingMod() {
    ipcMain.handle('checkExistingMod', (_e, modName) => {
        const modInstallationFolder = resolveModInstallationPath();
        const modInstallationPath = path.join(modInstallationFolder, modName);
        return fs.existsSync(modInstallationPath);
    });
}