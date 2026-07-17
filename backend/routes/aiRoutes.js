import express from 'express';
import { askAdvisor, getSuggestedQuestions } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

router.post('/ask', askAdvisor);
router.get('/suggested-questions', getSuggestedQuestions);

export default router;
