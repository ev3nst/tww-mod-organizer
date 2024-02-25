import { ipcMain } from 'electron';

export default function getModConflicts() {
    ipcMain.handle('getModConflicts', async () => {});
}
