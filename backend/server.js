const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
app.use(cors());
app.use(express.json());

const CSV_FILE = path.join(__dirname, 'glpi.csv');
const qrFolder = path.join(__dirname, 'qrcodes');

if (!fs.existsSync(qrFolder)) fs.mkdirSync(qrFolder);
app.use('/qrcodes', express.static(qrFolder));

app.get('/api/search-glpi/:sn', (req, res) => {
    const snToFind = req.params.sn.trim().toLowerCase();
    const results = [];

    if (!fs.existsSync(CSV_FILE)) {
        return res.status(404).json({ success: false, message: "Fichier CSV introuvable" });
    }

    fs.createReadStream(CSV_FILE)
        .pipe(csv({ separator: ';', headers: false })) // Headers false bech n-esta3mlou el indices
        .on('data', (data) => results.push(data))
        .on('end', () => {
            // Recheche f-el Index 8 (S/N)
            const asset = results.find(line => {
                const itemSN = line[8]; 
                return itemSN && itemSN.toString().trim().toLowerCase() === snToFind;
            });

            if (asset) {
                res.json({
                    success: true,
                    data: {
                        model: asset[6] || "N/A",  // Index 6
                        status: asset[7] || "N/A", // Index 7
                        ns: asset[8] || "N/A",     // Index 8
                        user: asset[9] || "N/A",   // Index 9
                        entity: asset[1] || "N/A", // Index 1
                        location: "Misfat"
                    }
                });
            } else {
                res.status(404).json({ success: false, message: "Asset non trouvé" });
            }
        });
});

app.post('/generate-qr', async (req, res) => {
    const { ns, model, usr, dept } = req.body;
    const fileName = `qr_${ns.replace(/[^a-z0-9]/gi, '_')}.png`;
    const filePath = path.join(qrFolder, fileName);
    const qrData = `Model: ${model}\nSN: ${ns}\nUser: ${usr}\nDept: ${dept}`;

    try {
        await QRCode.toFile(filePath, qrData);
        res.json({ qrCodeUrl: `http://localhost:3000/qrcodes/${fileName}` });
    } catch (err) {
        res.status(500).json({ error: "Erreur QR" });
    }
});

app.listen(3000, () => console.log('🚀 Backend Misfat Ready on Port 3000'));