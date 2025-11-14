import crypto from 'crypto';
import bcrypt from 'bcrypt';
import AppError from '../AppError';
import { generatePresignedUrl } from '../storage';

const CHAR_POOL = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    //'!@#$%^&*()-_=+[]{}|;:,.<>?/',
    '!@#$'
];

export const generatePassword = (length = 12) => {
    if (length < 4) {
        throw new Error("Password length should be at least 4.");
    }

    const passwordChars = CHAR_POOL.map(pool =>
        pool[crypto.randomInt(0, pool.length)]
    );

    const allChars = CHAR_POOL.join('');

    while (passwordChars.length < length) {
        passwordChars.push(allChars[crypto.randomInt(0, allChars.length)]);
    }

    for (let i = passwordChars.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    return passwordChars.join('');
}

export const hashPassword = (password: string) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

export const generateUuid = () => crypto.randomUUID();

export const validBranch = async (
    body: {
        branchPath: string,
        warehouseCase: () => Promise<void> | void,
        companyCase: () => Promise<void> | void,
        errorCase?: {
            message: string,
            status: number
        }
    }
) => {
    switch (body.branchPath) {
        case "Warehouse":
            await body.warehouseCase();
            break;
        case "Company":
            await body.companyCase();
            break;
        default:
            const errorCase = body.errorCase || { message: "Invalid user", status: 401 }
            throw new AppError(errorCase.message, errorCase.status);
    }

}

export const S3keysToUrl = async (
    key: string,
    docs: Record<string, any>
) => {
    const doc = docs[key];

    if (typeof doc === "string") {
        return await generatePresignedUrl(key);
    }

    if (Array.isArray(doc)) {
        return await Promise.all(doc.map(generatePresignedUrl));
    }
}