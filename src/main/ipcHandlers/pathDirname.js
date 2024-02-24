import { ipcMain } from 'electron';
import path from 'path';

export default function pathDirname() {
    ipcMain.handle('path:join', (_e, ...args) => {
        return path.join(args);
    });
}
