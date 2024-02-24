import { ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { getModInstallationPath } from '../tools/resolveManagedPaths';

export default function gameDeleteMod() {
    ipcMain.handle('game:deleteMod', async (_e, modName) => {
        const modInstallationFolder = getModInstallationPath();
        const modPath = path.join(modInstallationFolder, modName);
        if (fs.existsSync(modPath)) {
            await shell.trashItem(modPath);
        }
    });
}