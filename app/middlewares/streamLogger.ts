import logger from '../utils/logger';

export const stream = {
    write: (message: string) => logger.http(message.trim()),
};