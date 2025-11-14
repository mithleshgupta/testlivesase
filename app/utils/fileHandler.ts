import multer from 'multer';
import { extname } from 'path';
import { generateUuid } from './helpers';
import { UPLOAD_DIR } from './constants';

export const UploadMulter = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
        filename: (_req, file, cb) => cb(null, generateUuid() + extname(file.originalname))
    }),
    limits: {
        fileSize: 10485760 // 10 Mib
    }
});