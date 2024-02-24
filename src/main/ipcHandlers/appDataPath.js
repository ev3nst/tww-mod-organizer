import { ipcMain, app } from 'electron';

export default function appDataPath() {
    ipcMain.handle('appDataPath', () => {
        return app.getPath('appData');
    });
}
