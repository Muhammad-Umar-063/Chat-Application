import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
import { type Response } from 'express';

dotenv.config();

export const generateToken = (userId: string, res: Response): string => {
    const isProduction = process.env.NODE_ENV === 'production'
    const token = jwt.sign(
        {userId},
        process.env.JWT_SECRET!,
        {expiresIn: '30d'}
    )

    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    }) 

    return token;
}