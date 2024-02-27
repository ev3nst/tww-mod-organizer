import { makeAutoObservable, runInAction, toJS } from 'mobx';
import axios from 'axios';

class DownloadedFiles {
    files = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    async getFiles() {
        runInAction(() => {
            this.loading = true;
        });
        const archives = await window.electronAPI.getDownloadedArchives();
        runInAction(() => {
            if (
                typeof archives !== 'undefined' &&
                archives !== null &&
                typeof archives.length !== 'undefined' &&
                archives.length > 0
            ) {
                this.files = archives;
            }

            this.loading = false;
        });
    }

    async download(options) {
        const { headers } = await axios({
            url: options.url,
            method: 'GET',
            responseType: 'stream',
            onDownloadProgress: function (progressData) {
                console.log(progressData, 'progressData');
            },
        });

        const totalLength = headers['content-length'];
        let newFiles = toJS(this.files);
        newFiles.push({
            name: options.fileName,
            size: totalLength,
            date: null,
            path: options.filePath,
            progress: 0,
        });
        runInAction(() => {
            this.files = newFiles;
        });
    }
}

const downloadedFiles = new DownloadedFiles();
export default downloadedFiles;
