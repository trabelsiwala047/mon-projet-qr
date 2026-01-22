const express = require('express');
const sql = require('mssql/msnodesqlv8');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-7MGLSR7;Database=ms_devices;Trusted_Connection=yes;',
};

sql.connect(config).then(pool => {
    console.log("✅ Backend mrigel m3a SQL Server");

    // --- 🔐 LOGIN API ---
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

    // --- 🔍 RECHERCHE ASSET ---
    app.get('/api/asset/:sn', async (req, res) => {
        try {
            const result = await pool.request()
                .input('sn', sql.VarChar, req.params.sn.trim())
                .query('SELECT Serial_Number AS sn, Device_Name AS [user], Type AS model, State AS statut, comment FROM devices_finale WHERE Serial_Number = @sn');
            res.json(result.recordset[0] || { message: "Not found" });
        } catch (err) { res.status(500).send(err.message); }
    });

    // --- 💾 UPDATE ASSET ---
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

// --- 🚀 KHADDEM EL SERVER ---
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend khaddem 3al ${PORT}`);
});