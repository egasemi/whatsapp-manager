import { Router } from 'express';
import { getClient } from '../services/whatsappService';

export const router = Router();

router.post('/send', async (req, res) => {
  const { sessionId, to, message } = req.body;
  const client = getClient(sessionId);

  if (!client) return res.status(404).json({ error: 'Sesión no encontrada' });

  try {
    await client.sendMessage(to, message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar mensaje', details: err });
  }
});
