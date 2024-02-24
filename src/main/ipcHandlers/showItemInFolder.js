import { ipcMain, shell } from 'electron';

export default function showItemInFolder() {
    ipcMain.handle('shell:showItemInFolder', (_e, pathString) => {
        shell.showItemInFolder(pathString);
    });
}
