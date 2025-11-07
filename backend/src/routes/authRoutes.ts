import { Router } from 'express';
import { registerUser, loginUser, verifyToken } from '../services/authService';
import { logger } from '../utils/logger';

export const router = Router();

// Registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await registerUser(username, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  try {
    const result = await loginUser(username, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Falta token' });

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) return res.status(401).json({ error: 'Token inválido o expirado' });
  res.json({ valid: true, user: decoded });
});
