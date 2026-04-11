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

const userSocketMap = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId as string;
  console.log('A user connected:', socket.id, '| userId:', userId);

  if (userId) userSocketMap.set(userId, socket.id);

  // broadcast updated online users list to everyone
    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (userId) userSocketMap.delete(userId);
    io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
  });
});

export { app, io, server, userSocketMap };
