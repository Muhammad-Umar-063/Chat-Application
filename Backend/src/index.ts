import express, { type Express } from 'express';
import authRoutees from './routes/auth.routes.ts';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { connectDB } from './lib/db.ts';
import cookieParser from 'cookie-parser';
import msgRoutes from './routes/msg.routes.ts';
import {app, server} from './lib/socket.ts';

dotenv.config();
const PORT = Number(process.env.PORT) || 5001;
const allowedOrigins = (process.env.CLIENT_URLS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const __dirname = path.resolve();

app.use(cors({
        origin: allowedOrigins,
    credentials: true,
}))
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutees);
app.use("/api/messages", msgRoutes);

if (process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../Frontend/dist')));

    app.get(/.*/, (req : express.Request, res : express.Response) => {
        res.sendFile(path.join(__dirname, '../Frontend', 'dist', 'index.html'));
    })
}

server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();
});


