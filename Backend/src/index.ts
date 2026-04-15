import express, { type Express } from 'express';
import authRoutees from './routes/auth.routes.ts';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
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
const frontendDistPath = path.join(__dirname, '../Frontend/dist');

app.use(cors({
        origin: allowedOrigins,
    credentials: true,
}))
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutees);
app.use("/api/messages", msgRoutes);

if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistPath)){
    app.use(express.static(frontendDistPath));

    app.get(/.*/, (req : express.Request, res : express.Response) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    })
}

server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();
});


