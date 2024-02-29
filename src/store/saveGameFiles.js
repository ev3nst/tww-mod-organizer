import { makeAutoObservable, runInAction } from 'mobx';

class SaveGameFiles {
    files = [];
    loading = false;
    startupSaveGame = null;

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
                typeof saveFiles.length !== 'undefined'
            ) {
                this.files = saveFiles;
            }

            this.loading = false;
        });
    }
}

const saveGameFiles = new SaveGameFiles();
export default saveGameFiles;
