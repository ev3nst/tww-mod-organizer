import { makeAutoObservable, runInAction } from 'mobx';

class DownloadedFiles {
    files = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    async getFiles(managedGameFallback) {
        runInAction(() => {
            this.loading = true;
        });
        const archives =
            await window.electronAPI.getDownloadedArchives(managedGameFallback);
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
}

const downloadedFiles = new DownloadedFiles();
export default downloadedFiles;
