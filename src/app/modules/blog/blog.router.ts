
import { Router } from 'express';
import { blogController } from './blog.controller';

const router = Router();

router.get('/all', blogController.getAllBlog);
router.get('/:id', blogController.getBlogById);
router.post('/create', blogController.createBlog);
router.put('/update/:id', blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

export const blogRoutes = router;
