// @ts-ignore
import { Router } from 'express';
import { Contact } from '../models/Contact';
import { createController } from '../utils/factory';
import { validate } from '../middleware/validate';
import { contactSchema } from '../utils/validation';

const router = Router();
const controller = createController(Contact);

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', validate(contactSchema), controller.create);
router.put('/:id', validate(contactSchema.partial()), controller.update);
router.delete('/:id', controller.delete);

export default router;