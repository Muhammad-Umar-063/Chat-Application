import express from 'express';
import mongoose from 'mongoose';
import User from '../models/user.model.ts';
import Msgs from '../models/msg.model.ts';
import cloudinary from '../lib/cloudinary.ts';
import { getReceiverSocketId, io } from '../lib/socket.ts';


export const getMsgs = async (req : express.Request, res : express.Response) => {
    try {
        const { id: otherUserId } = req.params as { id: string };
        const myId = req.userId as string;
        const rawLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
        const rawBefore = Array.isArray(req.query.before) ? req.query.before[0] : req.query.before;
        const parsedLimit = Number.parseInt((rawLimit as string) ?? "30", 10);
        const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 50) : 30;

        if (!myId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const conversationFilter = {
            $or: [
                {senderId: myId, receiverId: otherUserId},
                {senderId: otherUserId, receiverId: myId}
            ]
        };

        const queryFilter: Record<string, unknown> = { ...conversationFilter };
        if (rawBefore) {
            const beforeDate = new Date(rawBefore as string);
            if (!Number.isNaN(beforeDate.getTime())) {
                queryFilter.createdAt = { $lt: beforeDate };
            }
        }

        const latestChunk = await Msgs.find(queryFilter)
            .sort({ createdAt: -1 })
            .limit(limit);

        const messages = [...latestChunk].reverse();

        let hasMore = false;
        if (messages.length > 0) {
            const oldestLoadedDate = messages[0].createdAt;
            const olderExists = await Msgs.exists({
                ...conversationFilter,
                createdAt: { $lt: oldestLoadedDate },
            });
            hasMore = Boolean(olderExists);
        }

        res.status(200).json({ messages, hasMore });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getUsersForSidebar = async (req : express.Request, res : express.Response) => {
    try{
        const loggedInUserId = req.userId as string;
        if (!loggedInUserId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const myObjectId = new mongoose.Types.ObjectId(loggedInUserId);

        const chattedUserIds = await Msgs.aggregate([
            {
                $match: {
                    $or: [{ senderId: myObjectId }, { receiverId: myObjectId }],
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $project: {
                    otherUserId: {
                        $cond: [{ $eq: ["$senderId", myObjectId] }, "$receiverId", "$senderId"],
                    },
                    unreadIncoming: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$receiverId", myObjectId] },
                                    { $eq: ["$seen", false] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                    createdAt: 1,
                },
            },
            {
                $group: {
                    _id: "$otherUserId",
                    lastMessageAt: { $max: "$createdAt" },
                    unreadCount: { $sum: "$unreadIncoming" },
                },
            },
            { $sort: { lastMessageAt: -1 } },
        ]);

        const orderedIds = chattedUserIds.map((entry) => entry._id.toString());

        if (!orderedIds.length) {
            res.status(200).json([]);
            return;
        }

        const users = await User.find({ _id: { $in: orderedIds } }).select('-password');
        const usersById = new Map(users.map((user) => [user._id.toString(), user]));
        const unreadById = new Map(
            chattedUserIds.map((entry) => [entry._id.toString(), entry.unreadCount ?? 0])
        );
        const orderedUsers = orderedIds
            .map((id) => {
                const user = usersById.get(id);
                if (!user) return null;

                return {
                    ...user.toObject(),
                    unreadCount: unreadById.get(id) ?? 0,
                };
            })
            .filter(Boolean);

        res.status(200).json(orderedUsers);
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const searchUsersByUsername = async (req: express.Request, res: express.Response) => {
    try {
        const myId = req.userId as string;
        if (!myId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const rawUsername = typeof req.query.username === 'string' ? req.query.username : '';
        const searchTerm = rawUsername.trim().toLowerCase();

        if (!searchTerm) {
            res.status(200).json([]);
            return;
        }

        const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const users = await User.find({
            _id: { $ne: myId },
            username: { $regex: `^${escapedSearch}`, $options: 'i' },
        })
            .select('-password')
            .limit(20);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error searching users by username:', error);
        res.status(500).json({ error: 'Internal server error' });
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

export const deleteConversation = async (req: express.Request, res: express.Response) => {
  try {
    const myId = req.userId as string;
    const { id: otherUserId } = req.params as { id: string };

    if (!myId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await Msgs.deleteMany({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    });

    res.status(200).json({ deletedCount: result.deletedCount ?? 0 });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};