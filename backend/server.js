const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connexion l-el base misfat.db
const db = new sqlite3.Database('./misfat.db', (err) => {
    if (err) console.error("❌ Erreur SQLite:", err.message);
    else console.log("✅ Connexion à SQLite réussie (misfat.db)");
});

// ROUTE 1: Recherche
app.get('/api/asset/:sn', (req, res) => {
    const serial = req.params.sn;
    const sql = "SELECT * FROM assets WHERE sn = ?";
    db.get(sql, [serial], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) res.json(row);
        else res.status(404).json({ message: "Asset non trouvé" });
    });
});

// ROUTE 2: Update Statut (El s-hi7a)
app.post('/api/asset/update', (req, res) => {
    const { sn, statut } = req.body;
    console.log(`📝 Commande reçue : Update ${sn} vers ${statut}`);

    const sql = "UPDATE assets SET statut = ? WHERE sn = ?";
    db.run(sql, [statut, sn], function(err) {
        if (err) {
            console.error("❌ Erreur SQL:", err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes > 0) {
            console.log("✅ Base de données mise à jour !");
            res.json({ success: true, message: "Statut mis à jour !" });
        } else {
            res.status(404).json({ success: false, message: "Asset non trouvé" });
        }
    });
});

// ROUTE 3: QR Generator (API Simulée)
app.post('/generate-qr', (req, res) => {
    const { ns } = req.body;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ns}`;
    res.json({ qrCodeUrl });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server khaddem 3al port ${PORT}`));