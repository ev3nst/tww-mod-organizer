import { ipcMain } from 'electron';

import db from '../db';
import dbKeys from '../db/keys';

export default function dbGet() {
    ipcMain.handle('dbGet', (_e, key) => {
        if (Object.values(dbKeys).includes(key)) {
            return db.get(key);
        }
    });
}
