import { ipcMain } from 'electron';
import fs from 'fs';

export default function fsExists() {
    ipcMain.handle('fs:exists', (_e, pathString) => {
        return fs.existsSync(pathString);
    });
}
