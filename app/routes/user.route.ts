import { Router } from 'express';

import {
    authorizationMiddleware,
    fileHandler,
    validateCsvFile
} from '../middlewares';

import {
    login,
    registerUsersByJSON,
    registerUsersByCSV,
    registerUsersByFile,
    getUserById,
    getUsers
} from '../controllers/user.controller';

const router = Router();

router.post(
    '/',
    authorizationMiddleware,
    getUsers
);

router.get(
    '/:userId',
    authorizationMiddleware,
    getUserById
);

router.patch(
    '/:userId',
    authorizationMiddleware,
    getUsers
);

router.post(
    '/login',
    login
);

router.post(
    '/register/json',
    authorizationMiddleware,
    registerUsersByJSON
);

router.post(
    '/register/csv',
    authorizationMiddleware,
    registerUsersByCSV
);

router.post(
    '/register/file/csv',
    authorizationMiddleware,
    fileHandler,
    validateCsvFile,
    registerUsersByFile
);

export default router;