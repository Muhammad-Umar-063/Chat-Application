import express from 'express';
import User from '../models/user.model.ts';
import Msgs from '../models/msg.model.ts';
import cloudinary from '../lib/cloudinary.ts';


export const getMsgs = async (req : express.Request, res : express.Response) => {
    try {
        const { id: otherUserId } = req.params
        const myId = req.user._id

        const Messages = await Msgs.find({
            $or: [
                {senderId: myId, receiverId: otherUserId},
                {senderId: otherUserId, receiverId: myId}
            ]
        })
        res.status(200).json(Messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getUsersForSidebar = async (req : express.Request, res : express.Response) => {
    try{
        const loggedInUserId = req.user._id;
        const getUsers = await User.find({_id: { $ne : loggedInUserId }}).select('-password');
        res.status(200).json(getUsers);
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const sendMsgs = async (req : express.Request, res : express.Response) => {
    try {
        const myId = req.user._id;
        const { id: otherUserId } = req.params;
        const { text, image } = req.body;

        let imageURL;
        if (image) {
            const uploadimg = await cloudinary.uploader.upload(image)
            imageURL = uploadimg.secure_url;
        }

        const newMsg = new Msgs({
            senderId: myId,
            receiverId: otherUserId,
            text,
            image: imageURL
        });

        // socketio here 

        await newMsg.save();
        res.status(201).json(newMsg);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}