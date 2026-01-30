const express = require('express');
const sql = require('mssql'); 
const QRCode = require('qrcode');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. CONFIG CORS (Houni el s7i7) ---
app.use(cors({
    origin: ['https://mon-projet-qr.vercel.app', 'http://localhost:5173'], // <-- BADAL HATHA b'lien Vercel mta3ek
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// --- 2. CONFIG DATABASE (Nesta3mlou process.env bech makhfi) ---
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_NAME,
    options: {
        encrypt: true, 
        trustServerCertificate: true
    }
};

// Connection Pool bech el server mayti7ch m3a barcha users
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("✅ Backend mrigel m3a SQL Server");
        return pool;
    })
    .catch(err => {
        console.log("❌ SQL Error:", err);
        process.exit(1);
    });

// --- 3. ROUTES ---

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user', sql.VarChar, username)
            .input('pass', sql.VarChar, password)
            .query('SELECT username FROM users WHERE username = @user AND password = @pass');

        if (result.recordset.length > 0) {
            res.json({ success: true, username: result.recordset[0].username });
        } else {
            res.status(401).json({ success: false, message: "Username ou Password ghalet!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/asset/:sn', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('sn', sql.VarChar, req.params.sn.trim())
            .query('SELECT Serial_Number AS sn, Device_Name AS [user], Type AS model, State AS statut, comment FROM devices_finale WHERE Serial_Number = @sn');
        res.json(result.recordset[0] || { message: "Not found" });
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/asset/update', async (req, res) => {
    try {
        const { sn, statut, it_comment } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('sn', sql.VarChar, sn)
            .input('statut', sql.VarChar, statut)
            .input('comment', sql.VarChar, it_comment)
            .query('UPDATE devices_finale SET State = @statut, comment = @comment WHERE Serial_Number = @sn');
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/generate-qr', async (req, res) => {
    const { usr, ns, model, dept } = req.body;
    const dataString = `USR: ${usr}\nNS: ${ns}\nModel: ${model}\nDept: ${dept}`;
    try {
        const qrDataUrl = await QRCode.toDataURL(dataString);
        res.json({ qrCodeUrl: qrDataUrl });
    } catch (err) {
        res.status(500).json({ error: 'Erreur QR Code' });
    }
});

// --- 4. EXPORT / LISTEN (Important lel Cloud) ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend khaddem 3al Port ${PORT}`);
});
