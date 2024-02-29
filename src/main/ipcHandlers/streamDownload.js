import axios from 'axios';
import { ipcMain, shell } from 'electron';
import fs from 'fs';

export default function streamDownload() {
    ipcMain.handle(
        'streamDownload',
        async (event, options, overwrite = false) => {
            if (overwrite === true) {
                await shell.trashItem(options.path);
            }

            const response = await axios({
                url: options.url,
                method: 'GET',
                responseType: 'stream',
                onDownloadProgress: (progressData) => {
                    event.sender.send('onStreamDownloadProgress', {
                        ...progressData,
                        ...options,
                    });
                },
            });

            const writer = fs.createWriteStream(options.path);
            await response.data.pipe(writer);
            return true;
        },
    );
}
