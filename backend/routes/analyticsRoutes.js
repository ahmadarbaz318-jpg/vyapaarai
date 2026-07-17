import express from 'express';
import { getDashboardSummary, getAnalytics } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.get('/dashboard', getDashboardSummary);
router.get('/', getAnalytics);

export default router;
