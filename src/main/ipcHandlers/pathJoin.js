import { ipcMain } from 'electron';
import path from 'path';

export default function pathJoin() {
    ipcMain.handle('path:dirname', (_e, pathString) => {
        return path.dirname(pathString);
    });
}
