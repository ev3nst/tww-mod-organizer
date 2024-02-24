import { ipcMain, shell } from 'electron';

export default function openExternalLink() {
    ipcMain.handle('openExternalLink', (_e, url) => {
        shell.openExternal(url);
    });
}
