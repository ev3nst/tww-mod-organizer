import { ipcMain } from 'electron';
import path from 'path';

export default function pathDirname() {
    ipcMain.handle('path:join', (_e, ...pathStrings) => {
        return path.join(pathStrings);
    });
}
