import { ipcMain, app } from 'electron';

export default function electronAppData() {
    ipcMain.handle('electron:appData', () => {
        return app.getPath('appData');
    });
}
