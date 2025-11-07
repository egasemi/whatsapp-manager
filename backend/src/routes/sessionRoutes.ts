import { Router } from 'express';
import { createSession, deleteSession } from '../services/whatsappService';
import { Session } from '../models/Session';

export const router = Router();

router.post('/', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId requerido' });

  try {
    const client = await createSession(sessionId);
    res.json({ message: `Sesión ${sessionId} inicializada` });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear sesión', details: err });
  }
});

router.get('/', async (req, res) => {
    const sessions = await Session.find().sort({updatedAt: -1});
    res.json(sessions)
})

router.delete('/',  async (req,res) => {
    const { sessionId } = req.body
    try {
        await deleteSession(sessionId)
        res.json({message: `Sessión ${sessionId} eliminada`})
    } catch (err) {
        res.status(500).json({error: 'Error al cerrar la sesión', details: err})
    }
})
