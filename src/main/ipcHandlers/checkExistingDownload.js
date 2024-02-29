import { ipcMain } from 'electron';
import fs from 'fs';

export default function checkExistingDownload() {
    ipcMain.handle('checkExistingDownload', (_e, downloadPath) => {
        const pathExists = fs.existsSync(downloadPath);
        return pathExists;
    });
}
