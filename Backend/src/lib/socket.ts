import {Server} from 'socket.io';
import http from 'http';
import express from 'express';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin:[ "http://localhost:5173" ]
    }
});

export function getReceiverSocketId(userId: string): string | undefined {
    return userSocketMap.get(userId);
}

const userSocketMap = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;
  console.log('A user connected:', socket.id, '| userId:', userId);

  if (userId) userSocketMap.set(userId, socket.id);

  // broadcast updated online users list to everyone
    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));

  socket.on('typing', ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing');
    }
  });

  socket.on('stopTyping', ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('stopTyping');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (userId) userSocketMap.delete(userId);
    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
  });
});

export { app, io, server, userSocketMap };
