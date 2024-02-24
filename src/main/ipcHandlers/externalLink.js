import { ipcMain, shell } from 'electron';

export default function externalLink() {
    ipcMain.handle('shell:externalLink', (_e, url) => {
        shell.openExternal(url);
    });
}
