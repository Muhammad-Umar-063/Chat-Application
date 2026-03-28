import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.ts';
import { generateToken } from '../lib/utils.ts'
import cloudinary from '../lib/cloudinary.ts';

interface SignupBody {
    email: string;
    password: string;
    fullName: string;
}

export const signup = async (req: Request<{}, {}, SignupBody>, res: Response): Promise<void> => {
    const { email, password, fullName } : SignupBody = req.body;
    try {
        if (!email || !password || !fullName) {
            res.status(400).json({ message: "All fields are required!" });
            return;
        }

        if (password.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters long!" });
            return;
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(400).json({ message: "User already exists!" });
            return;
        }

        const salt: string = await bcrypt.genSalt(10);
        const hashedPassword: string = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: hashedPassword,
            fullName,
        });

        await newUser.save();
        generateToken(newUser._id.toString(), res);

        res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            fullName: newUser.fullName,
            profilePic: newUser.profilePic,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error!" });
    }
};

export const login = async (req: Request<{}, {}, { email: string; password: string }>, res: Response): Promise<void> => {
    const {email , password} = req.body

    try{
        if (!email || !password) {
            res.status(400).json({message : 'All fields are required!'});
            return;
        }
        const user  = await User.findOne({
            email
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
            profilePic: user.profilePic
        });
    }catch(error){        
        console.error(error);
        res.status(500).json({message : 'Server error!'})
        return
    }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
    try{
        res.cookie('token', "", {maxAge: 0})
        res.status(200).json({message : 'Logged out successfully!'})
    }catch(error){
        console.error(error);
        res.status(500).json({message : 'Server error!'})
    }
};

export const updateProfile = async (req: Request<{}, {}, { profilePic: string }>, res: Response): Promise<void> => {
    try {
        const { profilePic } = req.body;
        const userId = req.userId;

        if (!profilePic) {
            res.status(400).json({ message: 'Profile picture is required!' });
            return;
        }

        const uploadPic = await cloudinary.uploader.upload(profilePic)

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