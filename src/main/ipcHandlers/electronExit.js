import { ipcMain, remote } from 'electron';

export default function electronExit() {
    ipcMain.handle('electronExit', () => {
        remote.getCurrentWindow().close();
    });
}
