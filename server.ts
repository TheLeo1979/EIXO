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
import axios from 'axios';
import crypto from 'crypto';
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

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'inactive',
    plan_id TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    moodBefore TEXT,
    intensityBefore INTEGER,
    moodAfter TEXT,
    intensityAfter INTEGER,
    feedback TEXT,
    interventionId TEXT,
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
app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'eixo-api', timestamp: new Date().toISOString() });
});

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

  const token = jwt.sign(
    { id: user.id, email: user.email }, 
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
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
  const { moodBefore, intensityBefore, moodAfter, intensityAfter, feedback, interventionId, completed } = req.body;
  const info = db.prepare(`
    INSERT INTO sessions (user_id, moodBefore, intensityBefore, moodAfter, intensityAfter, feedback, interventionId, completed) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, moodBefore, intensityBefore, moodAfter, intensityAfter, feedback, interventionId, completed ? 1 : 0);
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

// Mercado Pago Integration
app.post('/api/create-subscription', authenticateToken, async (req: any, res) => {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const appUrl = process.env.APP_URL || 'http://localhost:3000';

  if (!token) {
    return res.status(503).json({ error: 'Mercado Pago não configurado neste ambiente.' });
  }

  try {
    const response = await axios.post(
      'https://api.mercadopago.com/preapproval',
      {
        reason: 'Eixo Pleno - Plano Mensal',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 14.90,
          currency_id: 'BRL',
        },
        back_url: `${appUrl}/premium`,
        payer_email: req.user.email,
        external_reference: req.user.email,
        status: 'pending',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ init_point: response.data.init_point });
  } catch (e: any) {
    console.error('MP Subscription Error:', e.response?.data || e.message);
    res.status(500).json({ error: 'Erro ao criar assinatura no Mercado Pago.' });
  }
});

app.get('/api/subscription-status', authenticateToken, (req: any, res) => {
  const normalizedEmail = req.user.email.toLowerCase().trim();
  const sub: any = db.prepare('SELECT * FROM subscriptions WHERE email = ?').get(normalizedEmail);
  
  if (!sub) return res.json({ status: 'inactive' });
  
  // Sync is_premium if inconsistency exists (bonus safety)
  if (sub.status === 'authorized') {
    db.prepare('UPDATE users SET is_premium = 1 WHERE email = ?').run(normalizedEmail);
  } else {
    db.prepare('UPDATE users SET is_premium = 0 WHERE email = ?').run(normalizedEmail);
  }

  res.json(sub);
});

// Mercado Pago Webhooks
app.post('/api/webhooks/mercadopago', async (req, res) => {
  const { action, data, type } = req.body;
  const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  console.log('MP Webhook Received:', { action, type, id: data?.id });
  
  // Validation of X-Signature for production safety
  const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (webhookSecret) {
    const xSignature = req.headers['x-signature'] as string;
    const xRequestId = req.headers['x-request-id'] as string;
    
    if (!xSignature || !xRequestId) {
      console.warn('Webhook rejected: Missing signature headers');
      return res.status(401).json({ error: 'Missing signature headers' });
    }

    try {
      const parts = xSignature.split(',');
      const params: Record<string, string> = {};
      parts.forEach(p => {
        const [key, val] = p.split('=');
        if (key && val) params[key.trim()] = val.trim();
      });

      const ts = params['ts'];
      const receivedHash = params['v1'];
      
      if (!ts || !receivedHash) {
        console.warn('Webhook rejected: Incomplete signature parameters');
        return res.status(401).json({ error: 'Incomplete signature' });
      }

      // Construction of validation manifest
      const manifest = `id:${data?.id};request-id:${xRequestId};ts:${ts};`;
      const generatedHash = crypto
        .createHmac('sha256', webhookSecret)
        .update(manifest)
        .digest('hex');

      if (generatedHash !== receivedHash) {
        console.warn('Webhook rejected: Signature mismatch');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      console.log('Webhook signature verified successfully');
    } catch (e: any) {
      console.error('Signature validation error:', e.message);
      return res.status(400).json({ error: 'Signature validation failed' });
    }
  } else {
    console.warn('⚠️ Webhook received but X-Signature validation was skipped (MERCADO_PAGO_WEBHOOK_SECRET not configured)');
  }
  
  if ((type === 'subscription' || type === 'preapproval')) {
    if (!data?.id) {
      return res.status(400).json({ error: 'Missing data.id for subscription event' });
    }

    if (!mpToken) {
      console.warn('MP token missing during webhook processing');
      return res.status(503).json({ error: 'Mercado Pago token not configured' });
    }

    try {
      const response = await axios.get(`https://api.mercadopago.com/preapproval/${data.id}`, {
        headers: { Authorization: `Bearer ${mpToken}` }
      });
      
      const subData = response.data;
      const email = subData.external_reference;

      if (email) {
        const normalizedEmail = email.toLowerCase().trim();
        db.prepare(`
          INSERT INTO subscriptions (email, status, subscription_id, plan_id, updated_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(email) DO UPDATE SET
            status = excluded.status,
            subscription_id = excluded.subscription_id,
            updated_at = CURRENT_TIMESTAMP
        `).run(normalizedEmail, subData.status, subData.id, subData.preapproval_plan_id);

        if (subData.status === 'authorized') {
          db.prepare('UPDATE users SET is_premium = 1 WHERE email = ?').run(normalizedEmail);
        } else {
          db.prepare('UPDATE users SET is_premium = 0 WHERE email = ?').run(normalizedEmail);
        }
      }
    } catch (e: any) {
      console.error('Webhook processing error:', e.response?.data || e.message);
      // We return 200 anyway to prevent MP from retrying infinitely on logic errors, 
      // but logging helps debugging.
    }
  }

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
