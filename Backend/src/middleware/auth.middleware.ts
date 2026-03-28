/// <reference path="../types/express.d.ts" />
import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.ts';

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token || typeof token !== 'string') {
        res.status(401).json({ message: 'Unauthorized! No token provided.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            res.status(401).json({ message: 'Unauthorized! User not found.' });
            return;
        }
        req.userId = user._id.toString();
        req.user = user
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized! Invalid token.' });
    }
}