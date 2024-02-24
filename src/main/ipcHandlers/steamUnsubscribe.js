import { ipcMain } from 'electron';
import { unsubscribeFromWorkshop } from '../tools/steam';

export default function steamUnsubscribe() {
    ipcMain.handle('steam:unsubscribe', async (_e, workshopItemId) => {
        await unsubscribeFromWorkshop(workshopItemId);
    });
}
