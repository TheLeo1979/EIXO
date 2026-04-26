import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OAuth2Client } from 'google-auth-library';
import Mercadopago from 'mercadopago';
import SpotifyWebApi from 'spotify-web-api-node';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check for mandatory variables
if (!process.env.JWT_SECRET) {
  console.error('\n[ERRO CRÍTICO] JWT_SECRET não configurado.');
  console.error('Defina a variável de ambiente JWT_SECRET para iniciar o servidor com segurança.');
  console.error('No AI Studio, adicione no menu lateral: Settings > Secrets\n');
  process.exit(1);
}

const app = express();
const PORT = 3000;

// Database Setup
const db = new Database('eixo.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    name TEXT,
    is_premium BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    mood TEXT,
    intensity INTEGER,
    intervention_type TEXT,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Services Initialization
// Spotify - Flexible initialization
let spotifyApi: SpotifyWebApi | null = null;
if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
  spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
  });
}

app.use(cors());
app.use(bodyParser.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const normalizedEmail = email.toLowerCase().trim();
  let user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
  
  if (user) {
    // If user exists, check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta.' });
  } else {
    // Auto-registration flow
    const hashedPassword = await bcrypt.hash(password, 10);
    const info = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(normalizedEmail, hashedPassword, name || email.split('@')[0]);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, is_premium: user.is_premium } });
});

app.get('/api/me', authenticateToken, (req: any, res) => {
  const user: any = db.prepare('SELECT id, email, name, is_premium FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// Config Check Endpoint
app.get('/api/config/status', (req, res) => {
  res.json({
    mercadopago: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
    spotify: !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET)
  });
});

// Sessions
app.post('/api/sessions', authenticateToken, (req: any, res) => {
  const { mood, intensity, intervention_type } = req.body;
  const info = db.prepare('INSERT INTO sessions (user_id, mood, intensity, intervention_type) VALUES (?, ?, ?, ?)').run(req.user.id, mood, intensity, intervention_type);
  res.json({ id: info.lastInsertRowid });
});

app.get('/api/sessions/history', authenticateToken, (req: any, res) => {
  const sessions = db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(sessions);
});

// Spotify Tracks Resolver
app.get('/api/spotify/resolve', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query required' });

  try {
    // Basic stub if no credentials
    if (!process.env.SPOTIFY_CLIENT_ID) {
      return res.json({ 
        tracks: [
          { id: '1', name: `Relaxing Track for ${query}`, artist: 'Eixo Ambient', duration: '3:45' }
        ] 
      });
    }
    
    // Genuine Spotify call if configured
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    const searchResult = await spotifyApi.searchTracks(query as string);
    res.json({ tracks: searchResult.body.tracks?.items.map(t => ({ id: t.id, name: t.name, artist: t.artists[0].name, duration: t.duration_ms })) });
  } catch (e) {
    console.error('Spotify error:', e);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

// Mercado Pago Webhooks
app.post('/api/webhooks/mercadopago', (req, res) => {
  const { action, data } = req.body;
  console.log('MP Webhook:', action, data);
  // Logic to update user is_premium based on MP event
  res.sendStatus(200);
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
