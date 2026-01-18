import { Router } from 'express';
import { Activity } from '../models/Activity';
import { createController } from '../utils/factory';
import { validate } from '../middleware/validate';
import { activitySchema } from '../utils/validation';

const router = Router();
const controller = createController(Activity);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', validate(activitySchema), controller.create);
router.put('/:id', validate(activitySchema.partial()), controller.update);
router.delete('/:id', controller.delete);

export default router;
