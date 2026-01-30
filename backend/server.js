const express = require('express');
const { Pool } = require('pg'); // Badalna mssql b'pg
const QRCode = require('qrcode');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: '*', // Khalliha '*' tawa bch n'testou, ba3d badalha b'Vercel
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// --- CONFIG DATABASE (NEON POSTGRES) ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // El lien li khdhitou mel Neon
    ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
    console.log("✅ Backend mrigel m3a Neon Postgres");
});

// --- ROUTES (Syntax Postgres: $1 fi blast @user) ---

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT username FROM users WHERE username = $1 AND password = $2', [username, password]);

        if (result.rows.length > 0) {
            res.json({ success: true, username: result.rows[0].username });
        } else {
            res.status(401).json({ success: false, message: "Username ou Password ghalet!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/asset/:sn', async (req, res) => {
    try {
        const result = await pool.query('SELECT serial_number AS sn, device_name AS user, type AS model, state AS statut, comment FROM devices_finale WHERE serial_number = $1', [req.params.sn.trim()]);
        res.json(result.rows[0] || { message: "Not found" });
    } catch (err) { res.status(500).send(err.message); }
});

// --- LISTEN ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend khaddem 3al Port ${PORT}`);
});
