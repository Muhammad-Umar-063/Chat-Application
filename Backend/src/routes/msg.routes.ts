import express, {Router} from 'express';
import { getMsgs, getUsersForSidebar, sendMsgs } from '../controllers/msg.controller.ts';
import { protectRoute } from '../middleware/auth.middleware.ts';

const router: Router = express.Router();

router.get('/users', protectRoute, getUsersForSidebar)
router.get('/:id', protectRoute, getMsgs)
router.post('/send/:id', protectRoute, sendMsgs)

export default router;