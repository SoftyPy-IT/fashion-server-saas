import { Router } from 'express';
import { imageGalleryController } from './image-gallery.controller';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/cloudinary';
import validateRequest from '../../middlewares/validateRequest';
import {
  deleteImageFromGallerySchema,
  uploadImageToGallerySchema,
  createFolderSchema
} from './image-gallery.validation';

const router = Router();

router.get('/all', auth('admin'), imageGalleryController.getAllImages);
router.get('/folder/:folder', auth('admin'), imageGalleryController.getImagesByFolder);

router.post(
  '/upload',
  auth('admin'),
  upload.array('images'),
  validateRequest(uploadImageToGallerySchema),
  imageGalleryController.createImage
);

router.post(
  '/delete',
  auth('admin'),
  validateRequest(deleteImageFromGallerySchema),
  imageGalleryController.deleteImage
);

router.get('/folders', auth('admin'), imageGalleryController.getFolders);
router.get('/folders/:id', auth('admin'), imageGalleryController.getFolderById);

router.post(
  '/folder',
  auth('admin'),
  validateRequest(createFolderSchema),
  imageGalleryController.createFolder
);

router.put('/folder/update/:id', auth('admin'), imageGalleryController.updateFolder);

router.delete('/folder/:id', auth('admin'), imageGalleryController.deleteFolder);

export const imageGalleryRoutes = router;
