import { ipcMain } from 'electron';
import fs from 'fs';

export default function fsExists() {
    ipcMain.handle('fsExists', (_e, pathString) => {
        return fs.existsSync(pathString);
    });
}
