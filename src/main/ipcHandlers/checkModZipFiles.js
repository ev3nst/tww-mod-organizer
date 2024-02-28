import { dialog, ipcMain } from 'electron';
import { listArchive } from '../tools/7z';

export default function checkModZipFiles() {
    ipcMain.handle('checkModZipFiles', async (_e, zipPath) => {
        try {
            const zipPackFiles = await listArchive(zipPath, '*.pack');
            return zipPackFiles;
        } catch (e) {
            dialog.showErrorBox('Archive Error', String(e));
            console.log(e);
            return null;
        }
    });
}
