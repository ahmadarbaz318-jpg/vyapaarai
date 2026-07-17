import express from 'express';
import { createSale, getSales, getSale } from '../controllers/saleController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/', getSales);
router.get('/:id', getSale);
router.post('/', createSale);

export default router;
