import express, { type Express } from 'express';
import authRoutees from './routes/auth.routes.ts';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './lib/db.ts';
import cookieParser from 'cookie-parser';
import msgRoutes from './routes/msg.routes.ts';

const app: Express = express();

dotenv.config();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use("/api/auth", authRoutees);
app.use("/api/messages", msgRoutes);

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();
});


