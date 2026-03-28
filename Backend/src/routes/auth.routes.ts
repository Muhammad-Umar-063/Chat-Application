import express, {Router} from 'express';
import { checkAuth, login, logout, signup, updateProfile } from '../controllers/auth.controller.ts';
import { protectRoute } from '../middleware/auth.middleware.ts';

const router: Router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", protectRoute, logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check-auth", protectRoute, checkAuth);

export default router;