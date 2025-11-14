import { Router } from 'express';

import { authorizationMiddleware } from '../middlewares';

import {
    createRole,
    getRoles,
    getRoleById,
    updateRole
} from '../controllers/role.controller';

const router = Router();

router.get(
    '/',
    authorizationMiddleware,
    getRoles
);

router.get(
    '/:roleId',
    authorizationMiddleware,
    getRoleById
);

router.post(
    '/',
    authorizationMiddleware,
    createRole
);

router.patch(
    '/:roleId',
    authorizationMiddleware,
    updateRole
);

export default router;