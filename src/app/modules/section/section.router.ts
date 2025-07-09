import { Router } from 'express';
import { sectionController } from './section.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { createSectionSchema, updateSectionSchema } from './section.validation';

const router = Router();

router.get('/all', sectionController.getAllSection);
router.get('/:id', sectionController.getSectionById);
router.post(
  '/create',
  auth('admin'),
  validateRequest(createSectionSchema),
  sectionController.createSection
);
router.put(
  '/update/:id',
  auth('admin'),
  validateRequest(updateSectionSchema),
  sectionController.updateSection
);
router.delete('/:id', auth('admin'), sectionController.deleteSection);

export const sectionRoutes = router;
