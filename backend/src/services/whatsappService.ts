import { Client, LocalAuth } from 'whatsapp-web.js';
import { Session } from '../models/Session';
import qrcode from 'qrcode';
import { logger } from '../utils/logger';
import { Server as SocketServer } from 'socket.io'
import path from 'path'
import fs from 'fs'

const clients: Record<string, Client> = {};
let io:SocketServer | null = null
const AUTH_DIR = path.join(process.cwd(), '.wwebjs_auth');

export const setSocketInstance = (socketInstance:SocketServer) => {
    io = socketInstance;
}

export const createSession = async (sessionId: string) => {
  if (clients[sessionId]) {
      console.log(`La sesión ${sessionId} ya existe`);
      return;
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: sessionId }),
  });

  clients[sessionId] = client

  client.on('qr', async (qr) => {
    logger.info(`QR generado para sesión ${sessionId}`);
    const qrImage = await qrcode.toDataURL(qr);
    await Session.updateOne(
        {sessionId},
        { status: 'conectando', connected: false},
        { upsert: true }
    )

    if(io) {
        io.emit('qr', {sessionId, qr: qrImage});
        io.emit('status', {sessionId, message: 'conectando'})
    }
  });

  client.on('ready', async () => {
    logger.info(`Sesión ${sessionId} lista`);
    if (io) io.emit('status', { sessionId, message: 'conectado' });
    await Session.updateOne(
        { sessionId },
        { status: "conectado", connected: true, lastSeen: new Date() },
        { upsert: true }
    )
  });

  client.on('disconnected', async () => {
    logger.warn(`Sesión ${sessionId} desconectada`);
    delete clients[sessionId];
    if (io) io.emit('status', { sessionId, message: 'desconectado' });
    await Session.updateOne(
        { sessionId }, 
        { status: "desconectado", connected: false, lastSeen: new Date() },
        { upsert: true }

    )
  });

  await client.initialize();
  clients[sessionId] = client;
  return client;
};

export const restoreSessions = async () => {
    const saved = await Session.find();
    if (!saved.length) {
      logger.info('No hay sesiones guardadas para restaurar.');
      return;
    }
  
    logger.info(`Restaurando ${saved.length} sesiones guardadas...`);
    for (const s of saved) {
      logger.info(`Restaurando ${s.sessionId} (${s.status})`);
      if (io) io.emit('status', { sessionId: s.sessionId, message: 'conectando...' });
      createSession(s.sessionId);
    }
};

export const deleteSession = async (sessionId: string) => {
    try {
      logger.info(`Eliminando sesión ${sessionId}...`);
  
      // 1️⃣ Si hay un cliente activo, cerrarlo
      const client = clients[sessionId];
      if (client) {
        await client.logout();
        await client.destroy();
        delete clients[sessionId];
        logger.info(`Cliente ${sessionId} cerrado`);
      }
  
      // 2️⃣ Eliminar carpeta LocalAuth (tokens guardados)
      const authPath = path.join(AUTH_DIR, `session-${sessionId}`);
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
        logger.info(`Eliminados datos LocalAuth de ${sessionId}`);
      }
  
      // 3️⃣ Eliminar el registro en MongoDB
      await Session.deleteOne({ sessionId });
      logger.info(`Sesión ${sessionId} borrada de la base de datos`);
    } catch (err) {
        logger.error(`Error eliminando sesión ${sessionId}:`, err);
    }
};

export const listAuthFolders = async () => {
    try {
      if (!fs.existsSync(AUTH_DIR)) {
        logger.info('No existe el directorio .wwebjs_auth (aún no hay sesiones locales)');
        return [];
      }
  
      const dirs = fs.readdirSync(AUTH_DIR)
        .filter((d) => d.startsWith('session-'))
        .map((d) => d.replace('session-', ''));
  
      const dbSessions = await Session.find({}, 'sessionId status connected').lean();

      if (dirs.length === 0) logger.info('(ninguna carpeta encontrada)');
      else dirs.forEach((d) => logger.info(`local - ${d}`));

      if (dbSessions.length === 0) logger.info('(ningún registro guardado)');
      else dbSessions.forEach((s) => {
        logger.info(`db - ${s.sessionId} (${s.status}${s.connected ? ', conectada' : ', desconectada'})`);
      });
  
      // Devuelve un resumen útil
      return {
        disk: dirs,
        db: dbSessions.map((s) => s.sessionId),
        onlyOnDisk: dirs.filter((d) => !dbSessions.some((s) => s.sessionId === d)),
        onlyInDb: dbSessions.filter((s) => !dirs.includes(s.sessionId)).map((s) => s.sessionId),
      };
    } catch (err) {
      logger.error('Error listando carpetas de autenticación:', err);
      return null;
    }
};

export const getClient = (sessionId: string) => clients[sessionId];
