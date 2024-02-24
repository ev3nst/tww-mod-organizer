import { ipcMain, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { getModInstallationPath } from '../tools/resolveManagedPaths';

export default function gameDeleteMod() {
    ipcMain.handle('game:deleteMod', async (_e, title) => {
        const modInstallationFolder = getModInstallationPath();
        const modPath = path.join(modInstallationFolder, title);
        if (fs.existsSync(modPath)) {
            await shell.trashItem(modPath);
        }
    });
}
