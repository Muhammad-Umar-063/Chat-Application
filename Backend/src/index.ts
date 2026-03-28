import express, { type Express } from 'express';
import authRoutees from './routes/auth.routes.ts';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.ts';
import cookieParser from 'cookie-parser';
import msgRoutes from './routes/msg.routes.ts';

const app: Express = express();

dotenv.config();
const PORT = process.env.PORT

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutees);
app.use("/api/messages", msgRoutes);

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    await connectDB();
});


