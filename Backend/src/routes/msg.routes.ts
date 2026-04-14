import express, {Router} from 'express';
import { getMsgs, getUsersForSidebar, markMsgsAsSeen, searchUsersByUsername, sendMsgs } from '../controllers/msg.controller.ts';
import { protectRoute } from '../middleware/auth.middleware.ts';

const router: Router = express.Router();

router.get('/users', protectRoute, getUsersForSidebar)
router.get('/search', protectRoute, searchUsersByUsername)
router.get('/:id', protectRoute, getMsgs)
router.post('/send/:id', protectRoute, sendMsgs)
router.post('/seen/:id', protectRoute, markMsgsAsSeen)

export default router;