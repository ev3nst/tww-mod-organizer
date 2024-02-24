import { ipcMain, remote } from 'electron';

export default function electronExit() {
    ipcMain.handle('electron:exit', () => {
        remote.getCurrentWindow().close();
    });
}
