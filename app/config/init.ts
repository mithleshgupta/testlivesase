import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const initializeFolder = () => {
    const dir = join(__dirname, '../../uploads');
    if (!existsSync(dir)) mkdirSync(dir);
}