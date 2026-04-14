import express from 'express';
import User from '../models/user.model.ts';
import Msgs from '../models/msg.model.ts';
import cloudinary from '../lib/cloudinary.ts';
import { getReceiverSocketId, io } from '../lib/socket.ts';


export const getMsgs = async (req : express.Request, res : express.Response) => {
    try {
        const { id: otherUserId } = req.params as { id: string };
        const myId = req.userId as string;

        if (!myId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const Messages = await Msgs.find({
            $or: [
                {senderId: myId, receiverId: otherUserId},
                {senderId: otherUserId, receiverId: myId}
            ]
        }).sort({ createdAt: 1 })
        res.status(200).json(Messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getUsersForSidebar = async (req : express.Request, res : express.Response) => {
    try{
        const loggedInUserId = req.user._id as string;
        const getUsers = await User.find({_id: { $ne : loggedInUserId }}).select('-password');
        res.status(200).json(getUsers);
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const sendMsgs = async (req : express.Request, res : express.Response) => {
    try {
        const myId = req.userId as string;
        const { id: otherUserId } = req.params as { id: string };
        const { text, image } = req.body as { text: string; image: string };

        if (!myId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

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

        // socketio here to emit new message to receiver in real time
        await newMsg.save();
        res.status(201).json(newMsg);


        const receiverSocketId = getReceiverSocketId(otherUserId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMsg)
        }
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const markMsgsAsSeen = async (req: express.Request, res: express.Response) => {
    try {
        const myId = req.userId as string;
        const { id: otherUserId } = req.params as { id: string };

        if (!myId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const unseenMessages = await Msgs.find({
            senderId: otherUserId,
            receiverId: myId,
            seen: false,
        }).select("_id");

        if (!unseenMessages.length) {
            res.status(200).json({ updatedCount: 0, messageIds: [] });
            return;
        }

        const messageIds = unseenMessages.map((msg) => msg._id.toString());
        const seenAt = new Date();

        await Msgs.updateMany(
            { _id: { $in: messageIds } },
            { $set: { seen: true, seenAt } }
        );

        const senderSocketId = getReceiverSocketId(otherUserId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("messagesSeen", {
                by: myId,
                messageIds,
                seenAt: seenAt.toISOString(),
            });
        }

        res.status(200).json({
            updatedCount: messageIds.length,
            messageIds,
            seenAt: seenAt.toISOString(),
        });
    } catch (error) {
        console.error("Error marking messages as seen:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}