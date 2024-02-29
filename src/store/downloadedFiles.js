import { makeAutoObservable, runInAction, toJS } from 'mobx';

import dbKeys from '../main/db/keys';

class DownloadedFiles {
    files = [];
    loading = false;
    hasNexusAPI = false;

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
                typeof archives.length !== 'undefined'
            ) {
                this.files = archives;
            }

            this.loading = false;
        });
    }

    async download(options, overwrite = false) {
        let newFiles = toJS(this.files) || [];
        newFiles.push({
            name: options.fileName,
            size: 0,
            date: null,
            path: options.filePath,
            progress: 0,
        });

        runInAction(() => {
            this.files = newFiles;
        });

        this.downloadProgress(options, overwrite);
    }

    async checkNexusAPI() {
        const nexusAPIKey = await window.electronAPI.dbGet(
            dbKeys.NEXUS_API_KEY,
        );
        if (
            typeof nexusAPIKey !== 'undefined' &&
            nexusAPIKey !== null &&
            String(nexusAPIKey).length > 0
        ) {
            runInAction(() => {
                this.hasNexusAPI = true;
            });
        } else {
            runInAction(() => {
                this.hasNexusAPI = false;
            });
        }
    }
}

const downloadedFiles = new DownloadedFiles();
export default downloadedFiles;
