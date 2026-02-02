const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/', (req, res) => {
  res.send('Backend QR Code Live on Render!');
});

// --- LOGIN ---
app.post('/login', async (req, res) => {
  const { email, password } = req.body; // App.jsx tab3ath 'email' mouch 'username'
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [email, password]);
    if (result.rows.length > 0) {
      res.json({ success: true, token: 'fake-jwt-token', role: result.rows[0].role });
    } else {
      res.json({ success: false, message: 'Ghalta fi el username walla password' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- REGISTER ---
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', [username, password, role]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: "Username dejà mawjoud" }); }
});

// --- SEARCH ASSET ---
app.get('/api/asset/:sn', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assets WHERE serial_number = $1', [req.params.sn]);
    if (result.rows.length > 0) {
      const asset = result.rows[0];
      // N-rajj3ou el esm kima yestanna fih el Frontend (App.jsx)
      res.json({
        Device_Name: asset.device_name,
        Serial_Number: asset.serial_number,
        Type: asset.type,
        State: asset.statut,
        comment: asset.it_comment
      });
    } else { res.status(404).json({ message: 'Not found' }); }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- UPDATE ASSET ---
app.post('/api/asset/update', async (req, res) => {
  const { sn, statut, it_comment } = req.body;
  try {
    await pool.query('UPDATE assets SET statut = $1, it_comment = $2 WHERE serial_number = $3', [statut, it_comment, sn]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
