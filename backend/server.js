import express from 'express';
import cors from 'cors';
import fs from 'fs';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',').map(s => s.trim()).filter(Boolean);

const TOKEN_TTL_SEC = 60 * 60 * 24 * 30; // 30 днів (dev)
const CLOCK_TOLERANCE_SEC = 300;         // 5 хв допуск

const app = express();
const PORT = 3001;

app.use(cors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
}));
app.use(express.json({ limit: '15mb' }));

// ---------------- DB ----------------
const db = new Database('db.sqlite');

db.prepare(`
    CREATE TABLE IF NOT EXISTS events (
                                          id    TEXT PRIMARY KEY,
                                          name  TEXT NOT NULL,
                                          date  TEXT NOT NULL,
                                          place TEXT NOT NULL,
                                          image TEXT NOT NULL
    )
`).run();

function ensureColumn(table, name, type) {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all();
    const exists = cols.some(c => c.name === name);
    if (!exists) db.prepare(`ALTER TABLE ${table} ADD COLUMN ${name} ${type}`).run();
}
ensureColumn('events', 'price', 'TEXT');
ensureColumn('events', 'description', 'TEXT');

// optional preload
try {
    const data = fs.readFileSync('events.json', 'utf8');
    const items = JSON.parse(data);
    const ins = db.prepare(`INSERT OR IGNORE INTO events
    (id,name,date,place,image,price,description) VALUES (?,?,?,?,?,?,?)`);
    for (const e of items) {
        ins.run(e.id ?? crypto.randomUUID(), e.name, e.date, e.place, e.image, e.price ?? '', e.description ?? '');
    }
} catch (e) { if (e.code !== 'ENOENT') console.error(e); }

// ---------------- Auth ----------------
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function authenticateToken(req, res, next) {
    const auth = req.get('authorization') || '';
    const [scheme, token] = auth.split(' ');
    if (!token || (scheme || '').toLowerCase() !== 'bearer') {
        return res.status(401).json({ error: 'Missing bearer token' });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET, { clockTolerance: CLOCK_TOLERANCE_SEC });
        req.user = payload;
        next();
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                expiredAt: e.expiredAt?.toISOString?.() || String(e.expiredAt),
                now: new Date().toISOString(),
            });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
}

// ---------------- Events API ----------------
app.get('/events', (_req, res) => {
    const rows = db.prepare('SELECT * FROM events ORDER BY date ASC').all();
    res.json(rows);
});

app.get('/events/:id', (req, res) => {
    const one = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (one) return res.json(one);
    res.status(404).json({ error: 'Not found' });
});

app.post('/events', authenticateToken, (req, res) => {
    const { name, date, place, image, price = '', description = '' } = req.body;
    if (!name || !date || !place || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const id = crypto.randomUUID();
    db.prepare(`INSERT INTO events (id,name,date,place,image,price,description)
                VALUES (?,?,?,?,?,?,?)`)
        .run(id, name, date, place, image, String(price), String(description));
    res.status(201).json({ id, name, date, place, image, price: String(price), description: String(description) });
});

app.patch('/events/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const { name, date, place, image, price, description } = req.body;
    const fields = [], values = [];
    if (name !== undefined)        { fields.push('name = ?');        values.push(name); }
    if (date !== undefined)        { fields.push('date = ?');        values.push(date); }
    if (place !== undefined)       { fields.push('place = ?');       values.push(place); }
    if (image !== undefined)       { fields.push('image = ?');       values.push(image); }
    if (price !== undefined)       { fields.push('price = ?');       values.push(String(price)); }
    if (description !== undefined) { fields.push('description = ?'); values.push(String(description)); }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    values.push(id);
    const sql = `UPDATE events SET ${fields.join(', ')} WHERE id = ?`;
    const info = db.prepare(sql).run(...values);
    if (!info.changes) return res.status(404).json({ error: 'Event not found' });
    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.json(updated);
});

app.delete('/events/:id', authenticateToken, (req, res) => {
    const info = db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
    if (info.changes) return res.json({ success: true });
    res.status(404).json({ error: 'Event not found' });
});

// ---------------- Users ----------------
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
                                         id TEXT PRIMARY KEY,
                                         user_name TEXT NOT NULL,
                                         surname TEXT NOT NULL,
                                         email TEXT UNIQUE NOT NULL,
                                         password_hash TEXT NOT NULL,
                                         user_group TEXT NOT NULL,
                                         phone TEXT NOT NULL
    )
`).run();

app.post('/register', (req, res) => {
    const { user_name, surname, email, password, user_group, phone } = req.body;
    if (!email || !password || !user_group || !phone || !user_name || !surname) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const id = crypto.randomUUID();
    const password_hash = hashPassword(password);
    db.prepare(`INSERT INTO users (id,user_name,surname,email,password_hash,user_group,phone)
                VALUES (?,?,?,?,?,?,?)`)
        .run(id, user_name, surname, email, password_hash, user_group, phone);
    res.status(201).json({ success: true });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const password_hash = hashPassword(password);
    if (password_hash !== user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });

    const isAdmin = adminEmails.includes(user.email);
    const nowSec = Math.floor(Date.now() / 1000);
    const payload = { id: user.id, email: user.email, isAdmin, iat: nowSec, exp: nowSec + TOKEN_TTL_SEC };
    const token = jwt.sign(payload, JWT_SECRET);
    res.json({ token, expiresAt: new Date(payload.exp * 1000).toISOString() });
});

// ---------------- Diagnostics ----------------
app.get('/me', authenticateToken, (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const isAdmin = adminEmails.includes(user.email);
    res.json({ id: user.id, email: user.email, isAdmin, exp: req.user.exp });
});
app.get('/time', (_req, res) => res.json({ nowMs: Date.now(), nowIso: new Date().toISOString() }));
app.get('/debug-token', (req, res) => {
    const token = (req.get('authorization') || '').split(' ')[1] || req.query.t;
    if (!token) return res.status(400).json({ error: 'No token provided' });
    const decoded = jwt.decode(token, { complete: true });
    res.json({ nowSec: Math.floor(Date.now()/1000), nowIso: new Date().toISOString(), header: decoded?.header, payload: decoded?.payload });
});

// ---------------- Server ----------------
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
