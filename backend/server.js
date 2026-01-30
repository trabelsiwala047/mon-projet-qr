const express = require('express');
const sql = require('mssql'); // Na7ina msnodesqlv8 khaterha mta' Windows barka
const QRCode = require('qrcode');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 🛠️ CONFIG DATABASE (Lezem t7ott el lien mta' database cloud hna) ---
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // IMPORTANT lel Cloud
        trustServerCertificate: true
    }
};

sql.connect(config).then(pool => {
    console.log("✅ Backend mrigel m3a SQL Server");

    app.post('/api/login', async (req, res) => {
        try {
            const { username, password } = req.body;
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
            const result = await pool.request()
                .input('sn', sql.VarChar, req.params.sn.trim())
                .query('SELECT Serial_Number AS sn, Device_Name AS [user], Type AS model, State AS statut, comment FROM devices_finale WHERE Serial_Number = @sn');
            res.json(result.recordset[0] || { message: "Not found" });
        } catch (err) { res.status(500).send(err.message); }
    });

    app.post('/api/asset/update', async (req, res) => {
        try {
            const { sn, statut, it_comment } = req.body;
            await pool.request()
                .input('sn', sql.VarChar, sn)
                .input('statut', sql.VarChar, statut)
                .input('comment', sql.VarChar, it_comment)
                .query('UPDATE devices_finale SET State = @statut, comment = @comment WHERE Serial_Number = @sn');
            res.json({ success: true });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

}).catch(err => console.log("❌ SQL Error:", err));

app.post('/generate-qr', async (req, res) => {
    const { usr, ns, model, dept } = req.body;
    const dataString = `USR: ${usr}\nNS: ${ns}\nModel: ${model}\nDept: ${dept}`;
    try {
        const qrDataUrl = await QRCode.toDataURL(dataString);
        res.json({ qrCodeUrl: qrDataUrl });
    } catch (err) {
        res.status(500).json({ error: 'Erreur' });
    }
});

// --- 🚀 KHADDEM EL SERVER (Tariqa s7i7a) ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend khaddem 3al Port ${PORT}`);
});
