import { ipcMain } from 'electron';
import path from 'path';

export default function pathDirname() {
    ipcMain.handle('pathDirname', (_e, pathString) => {
        return path.dirname(pathString);
    });
}
