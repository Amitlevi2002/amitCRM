// @ts-ignore
import { Router } from 'express';
import { Lead } from '../models/Lead';
import { createController } from '../utils/factory';
import { validate } from '../middleware/validate';
import { leadSchema } from '../utils/validation';

const router = Router();
const controller = createController(Lead);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', validate(leadSchema), controller.create);
router.put('/:id', validate(leadSchema.partial()), controller.update);
router.delete('/:id', controller.delete);

export default router;