import { ipcMain } from 'electron';
import { unsubscribeFromWorkshop } from '../tools/steam';

export default function steamUnsubscribe() {
    ipcMain.handle('steamUnsubscribe', async (_e, workshopItemId) => {
        await unsubscribeFromWorkshop(workshopItemId);
    });
}
