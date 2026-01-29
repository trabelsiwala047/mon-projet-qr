require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

const config = {
    user: 'misfat_user', 
    password: '123456', 
    server: '127.0.0.1', 
    database: 'ms_devices',
    options: {
        encrypt: false, 
        trustServerCertificate: true,
        enableArithAbort: true
    },
    port: 1433
};
// 1. Hedhi lezem tkoune l'fou9 jmla (ba3d el config)
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ SQL Server Connected (ms_devices)');
    return pool;
  })
  .catch(err => console.log('❌ Database Connection Failed: ', err));

let pool;
async function connectDB() {
    try {
        pool = await sql.connect(config);
        console.log('✅ SQL Server Connected (ms_devices)');
    } catch (err) {
        console.error('❌ SQL Connection Error:', err.message);
    }
}
connectDB();

// --- LOGIN ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.request()
            .input('uParam', sql.NVarChar, email) 
            .query('SELECT * FROM users WHERE username = @uParam');

        const user = result.recordset[0];
        if (user && user.password === password) {
            const token = jwt.sign({ id: user.id, role: user.role }, 'MISFAT_SECRET', { expiresIn: '2h' });
            res.json({ success: true, token, role: user.role });
        } else {
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 2. Tawwa el code mta3 el register mte3ek iwalli hakka (zid thabet fel assemi):
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        // Hna nasta3mlou poolPromise elli dert-ha l'fou9
        const pool = await poolPromise; 
        
        await pool.request()
            .input('uParam', sql.NVarChar, username)
            .input('pParam', sql.NVarChar, password)
            .input('rParam', sql.NVarChar, role)
            .query('INSERT INTO users (username, password, role) VALUES (@uParam, @pParam, @rParam)');
        
        res.json({ success: true });
    } catch (err) {
        console.error("Erreur SQL fel Register:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- SEARCH DEVICE (T-jib el m3aloumet el kol) ---
app.get('/api/asset/:sn', async (req, res) => {
    try {
        const { sn } = req.params;
        const result = await pool.request()
            .input('snParam', sql.NVarChar, sn.trim())
            .query('SELECT * FROM devices_finale WHERE Serial_Number = @snParam');

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: "Asset non trouvé" });
        }
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// --- UPDATE DEVICE ---
app.post('/api/asset/update', async (req, res) => {
    const { sn, statut, it_comment } = req.body;
    try {
        await pool.request()
            .input('snParam', sql.NVarChar, sn)
            .input('stateParam', sql.NVarChar, statut)
            .input('commentParam', sql.NVarChar, it_comment)
            .query('UPDATE devices_finale SET State = @stateParam, comment = @commentParam WHERE Serial_Number = @snParam');
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Erreur update" });
    }
});

app.listen(3001, () => console.log(`🚀 Backend running on port 3001`));