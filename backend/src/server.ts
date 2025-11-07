import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io'
import dotenv from 'dotenv';
import { router as sessionRoutes } from './routes/sessionRoutes';
import { router as messageRoutes } from './routes/messageRoutes';
import { router as authRoutes } from './routes/authRoutes';
import { authenticate } from './middleware/authMiddleware';
import { logger } from './utils/logger';
import { setSocketInstance, restoreSessions, listAuthFolders } from "./services/whatsappService"

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

app.use('/api/auth', authRoutes);

app.use('/api/sessions', authenticate, sessionRoutes);
app.use('/api/messages', messageRoutes);

const server = http.createServer(app);
const io = new SocketServer(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "DELETE"],
        allowedHeaders: ["Content-Type"],
        credentials: true
      }
})

setSocketInstance(io)

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/whatsapp';

mongoose.connect(MONGO_URI)
mongoose.connection.once('open', async () => {
    logger.info('MongoDB conectado')
    await restoreSessions()
    await listAuthFolders()
})

server.listen(PORT, () => logger.info(`Servidor escuchando en http://localhost:${PORT}`));

io.on('connection', (socket) => {
    logger.info(`Cliente conectado: ${socket.id}`)

    socket.on('disconnect', () => {
        logger.info(`Cliente desconectado: ${socket.id}`)
    })
})
