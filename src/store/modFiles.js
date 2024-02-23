import { makeAutoObservable, runInAction } from 'mobx';

class ModFiles {
    files = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    async getFiles() {
        runInAction(() => {
            this.loading = true;
        });
        const modFiles = await window.electronAPI.getModFiles();
        runInAction(() => {
            if (
                typeof modFiles !== 'undefined' &&
                modFiles !== null &&
                typeof modFiles.length !== 'undefined' &&
                modFiles.length > 0
            ) {
                this.files = modFiles;
            }

            this.loading = false;
        });
    }
}

const modFiles = new ModFiles();
export default modFiles;
