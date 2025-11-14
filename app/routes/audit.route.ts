import { Router } from 'express';

import {
    stageEpcs,
    scanEpcs
} from '../controllers/audit.controller';

import validUser from '../middlewares/validUser';

import { authorizationMiddleware } from '../middlewares';

const router = Router();

router.post(
    '/stage',
    authorizationMiddleware,
    validUser.warehouse,
    stageEpcs
);

router.post(
    '/scan/:uuid',
    authorizationMiddleware,
    scanEpcs
);

export default router;