const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
app.use(cors());
app.use(express.json());

// Thabet elli el fichier glpi.csv m7atout ba7da server.js
const CSV_FILE = path.join(__dirname, 'glpi.csv');
const qrFolder = path.join(__dirname, 'qrcodes');

if (!fs.existsSync(qrFolder)) fs.mkdirSync(qrFolder);
app.use('/qrcodes', express.static(qrFolder));

// API Recherche Asset f-el CSV
app.get('/api/search-glpi/:sn', (req, res) => {
    const snToFind = req.params.sn.trim().toLowerCase();
    const results = [];

    if (!fs.existsSync(CSV_FILE)) {
        return res.status(404).json({ success: false, message: "Fichier glpi.csv introuvable" });
    }

    console.log(`\n🔎 Recherche du S/N: ${snToFind}`);

    fs.createReadStream(CSV_FILE)
        .pipe(csv({ 
            separator: ';', // 👈 Hna m-rigel 3la el point-virgule
            mapHeaders: ({ header }) => header.trim() 
        }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // Recheche b-el "Numero de serie"
            const asset = results.find(item => {
                const itemSN = item["Numero de serie"];
                return itemSN && itemSN.toString().toLowerCase().includes(snToFind);
            });

            if (asset) {
                console.log("✅ Asset trouvé:", asset["Model"]);
                res.json({
                    success: true,
                    data: {
                        ns: asset["Numero de serie"],
                        model: asset["Model"],
                        user: asset["Usager"] || "N/A",
                        phone: asset["numero"] || "N/A",
                        status: asset["Statut"] || "N/A",
                        entity: "MISFAT"
                    }
                });
            } else {
                console.log("⚠️ Aucun asset trouvé.");
                res.json({ success: false, message: "S/N introuvable dans le fichier CSV" });
            }
        });
});

// API Génération QR Code
app.post('/generate-qr', async (req, res) => {
    const { usr, ns, model, status } = req.body;
    if (!ns) return res.status(400).json({ error: "S/N manquant" });

    const fileName = `qr_${ns.replace(/[^a-z0-9]/gi, '_')}.png`;
    const filePath = path.join(qrFolder, fileName);
    
    // El ma3loumet eli bech ykounou fi wast el QR Code
    const qrData = `Model: ${model}\nSN: ${ns}\nUser: ${usr}\nStatus: ${status}`;

    try {
        await QRCode.toFile(filePath, qrData, { 
            width: 300,
            color: { dark: '#000000', light: '#ffffff' }
        });
        res.json({ qrCodeUrl: `http://localhost:3000/qrcodes/${fileName}` });
    } catch (err) {
        res.status(500).json({ error: "Erreur QR" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 SERVEUR CSV PRÊT: http://localhost:${PORT}`);
    console.log(`📂 Lecture du fichier: ${CSV_FILE}`);
});