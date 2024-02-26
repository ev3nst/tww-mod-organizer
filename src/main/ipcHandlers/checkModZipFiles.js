import { ipcMain } from 'electron';
import { unzipSync } from 'fflate';

import { openZip } from '../tools/unzip';

export default function checkModZipFiles() {
    ipcMain.handle('checkModZipFiles', async (_e, zipPath) => {
        const zipData = await openZip(zipPath);
        const zipFiles = unzipSync(await openZip(zipData));
        return Object.keys(zipFiles);
    });
}
