import express from 'express';
import cors from 'cors';
import fs from 'fs';
import Database from 'better-sqlite3';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined! Did you forget .env or rename key.env?");
    process.exit(1); // зупиняє сервер, бо без секрету працювати небезпечно
}

// Підключення до бази даних
const db = new Database('db.sqlite');

// Створення таблиці, якщо її ще нема
db.prepare(`
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        date TEXT NOT NULL,
        place TEXT NOT NULL,
        image TEXT NOT NULL
    )
`).run();

// Завантаження з JSON і вставка в БД
try {
    const data = fs.readFileSync('events.json', 'utf8');
    const eventsFromFile = JSON.parse(data);

    const insert = db.prepare(`INSERT OR IGNORE INTO events (id, name, date, place, image) VALUES (?, ?, ?, ?, ?)`);

    for (const e of eventsFromFile) {
        insert.run(e.id, e.name, e.date, e.place, e.image);
    }

    console.log('Events loaded from JSON and inserted into SQLite DB');
} catch (err) {
    console.error('Error reading events.json:', err);
}

// Отримати всі події
app.get('/events', (req, res) => {
    const rows = db.prepare('SELECT * FROM events').all();
    res.json(rows);
});

// Отримати подію за ID
app.get('/events/:id', (req, res) => {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (event) {
        res.json(event);
    } else {
        res.status(404).json({ error: "Not found" });
    }
});

// Додати нову подію
app.post('/events', (req, res) => {
    const { name, date, place, image } = req.body;

    if (!name || !date || !place || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = crypto.randomUUID();
    db.prepare(`INSERT INTO events (id, name, date, place, image) VALUES (?, ?, ?, ?, ?)`)
        .run(id, name, date, place, image);

    res.status(201).json({ id, name, date, place, image });
});

// Видалити подію за ID
app.delete('/events/:id', (req, res) => {
    const id = req.params.id;
    const result = db.prepare('DELETE FROM events WHERE id = ?').run(id);

    if (result.changes > 0) {
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Event not found" });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});



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

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

app.post('/register', (req, res) => {
    const { user_name, surname, email, password, user_group, phone } = req.body;
    if (!email || !password || !user_group || !phone || !user_name || !surname) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const id = crypto.randomUUID();
    const password_hash = hashPassword(password);
    db.prepare('INSERT INTO users (id, user_name, surname, email, password_hash, user_group, phone) VALUES (?, ?, ?, ?, ?, ?, ?)')
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

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user; // додаємо інформацію про користувача в запит
        next();
    });
}

app.post('/events', authenticateToken, (req, res) => {
    const { name, date, place, image } = req.body;

    if (!name || !date || !place || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = crypto.randomUUID();
    db.prepare(`INSERT INTO events (id, name, date, place, image) VALUES (?, ?, ?, ?, ?)`)
        .run(id, name, date, place, image);

    res.status(201).json({ id, name, date, place, image });
});

db.prepare(`
    CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        UNIQUE(user_id, event_id)
        )
`).run();

app.post('/subscribe', authenticateToken, (req, res) => {
    const { event_id } = req.body;
    const user_id = req.user.id;

    if (!event_id) return res.status(400).json({ error: "Missing event ID" });

    const subId = crypto.randomUUID();
    try {
        db.prepare(`INSERT INTO subscriptions (id, user_id, event_id) VALUES (?, ?, ?)`)
            .run(subId, user_id, event_id);
        res.json({ success: true });
    } catch (e) {
        res.status(409).json({ error: "Already subscribed" });
    }
});

app.get('/subscriptions/:eventId', authenticateToken, (req, res) => {
    const user_id = req.user.id;
    const event_id = req.params.eventId;

    const sub = db.prepare(`SELECT * FROM subscriptions WHERE user_id = ? AND event_id = ?`)
        .get(user_id, event_id);

    res.json({ subscribed: !!sub });
});

app.get('/my-subscriptions', authenticateToken, (req, res) => {
    const user_id = req.user.id;

    const events = db.prepare(`
        SELECT events.* FROM events
        JOIN subscriptions ON events.id = subscriptions.event_id
        WHERE subscriptions.user_id = ?
    `).all(user_id);

    res.json(events);
});

