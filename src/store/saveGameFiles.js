import { makeAutoObservable, runInAction } from 'mobx';

class SaveGameFiles {
    files = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    async getFiles() {
        runInAction(() => {
            this.loading = true;
        });
        const saveFiles = await window.electronAPI.getSaveFiles();
        runInAction(() => {
            if (
                typeof saveFiles !== 'undefined' &&
                saveFiles !== null &&
                typeof saveFiles.length !== 'undefined' &&
                saveFiles.length > 0
            ) {
                this.files = saveFiles;
            }

            this.loading = false;
        });
    }
}

const saveGameFiles = new SaveGameFiles();
export default saveGameFiles;
