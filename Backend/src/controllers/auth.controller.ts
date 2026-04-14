import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.ts';
import { generateToken } from '../lib/utils.ts'
import cloudinary from '../lib/cloudinary.ts';

interface SignupBody {
    email: string;
    password: string;
    fullName: string;
    username: string;
}

export const signup = async (req: Request<{}, {}, SignupBody>, res: Response): Promise<void> => {
    const { email, password, fullName, username } : SignupBody = req.body;
    try {
        if (!email || !password || !fullName || !username) {
            res.status(400).json({ message: "All fields are required!" });
            return;
        }

        const normalizedUsername = username.trim().toLowerCase();

        if (!/^[a-z0-9_.]{3,20}$/.test(normalizedUsername)) {
            res.status(400).json({ message: "Username must be 3-20 chars and can include letters, numbers, _ and ." });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters long!" });
            return;
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username: normalizedUsername }],
        });

        if (existingUser) {
            if (existingUser.email === email) {
                res.status(400).json({ message: "Email already exists!" });
            } else {
                res.status(400).json({ message: "Username already taken!" });
            }
            return;
        }

        const salt: string = await bcrypt.genSalt(10);
        const hashedPassword: string = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            fullName,
            username: normalizedUsername,
        });

        await newUser.save();
        generateToken(newUser._id.toString(), res);

        res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            fullName: newUser.fullName,
            username: newUser.username,
            profilePic: newUser.profilePic,
        });

    } catch (error) {
        const mongoError = error as { code?: number; keyPattern?: Record<string, number> };
        if (mongoError?.code === 11000) {
            if (mongoError.keyPattern?.username) {
                res.status(400).json({ message: "Username already taken!" });
                return;
            }

            if (mongoError.keyPattern?.email) {
                res.status(400).json({ message: "Email already exists!" });
                return;
            }
        }

        console.error(error);
        res.status(500).json({ message: "Server error!" });
    }
};

export const login = async (req: Request<{}, {}, { username: string; password: string }>, res: Response): Promise<void> => {
    const { username, password } = req.body

    try{
        if (!username || !password) {
            res.status(400).json({message : 'All fields are required!'});
            return;
        }

        const normalizedUsername = username.trim().toLowerCase();

        if (!/^[a-z0-9_.]{3,20}$/.test(normalizedUsername)) {
            res.status(400).json({ message: "Invalid username format!" });
            return;
        }

        const user  = await User.findOne({
            username: normalizedUsername,
        })
        if (!user){
            res.status(400).json({message : 'Invalid credentials!'});
            return;
        }
        const isMatch: boolean = await bcrypt.compare(password, user.password);
        
        if (!isMatch){
            res.status(400).json({message: 'Invalid credentials!'});
            return;
        }
        
        generateToken(user._id.toString(), res);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic
        });
    }catch(error){        
        console.error(error);
        res.status(500).json({message : 'Server error!'})
        return
    }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
    try {
        const isProduction = process.env.NODE_ENV === 'production';
        res.clearCookie('token', { 
        maxAge: 0, 
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        });
        res.status(200).json({ message: 'Logged out successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error!' });
    }
};

export const updateProfile = async (req: Request<{}, {}, { profilePic?: string }>, res: Response): Promise<void> => {
    try {
        const { profilePic } = req.body;
        const userId = req.userId;

        if (!profilePic || typeof profilePic !== 'string') {
            res.status(400).json({ message: 'A valid base64 profile picture is required!' });
            return;
        }

        const uploadPic = await cloudinary.uploader.upload(profilePic, {
            resource_type: 'image',
            folder: 'profile_pics',
        })

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadPic.secure_url },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error!' });
        return
    }
};


export const checkAuth = async (req: Request, res: Response): Promise<void> => {
    try{
        res.status(200).json(req.user); 
    }catch(error){        
        console.error(error);
        res.status(500).json({message : 'Server error!'})
    }
}