const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
app.use(cors());
app.use(express.json());

const qrDir = path.join(__dirname, 'qrcodes');
if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir);
app.use('/qrcodes', express.static(qrDir));

// --- ROUTE 1: GENERATION QR ---
app.post('/generate-qr', async (req, res) => {
  try {
    const { usr, ns, model, dept } = req.body;
    const text = `User: ${usr}\nNS: ${ns}\nModel: ${model}\nDept: ${dept}`;
    const fileName = `qr_${ns || Date.now()}.png`;
    const filePath = path.join(qrDir, fileName);
    await QRCode.toFile(filePath, text);
    res.json({ qrCodeUrl: `http://127.0.0.1:3000/qrcodes/${fileName}` });
  } catch (err) {
    res.status(500).json({ error: "Erreur QR" });
  }
});

// --- ROUTE 2: RECHERCHE GLPI (Version Robuste) ---
app.get('/api/search-glpi/:ns', (req, res) => {
  const nsToSearch = req.params.ns.trim();
  const results = [];

  if (!fs.existsSync('glpi.csv')) {
    return res.status(500).json({ success: false, message: "Fichier glpi.csv introuvable" });
  }

  fs.createReadStream('glpi.csv')
    .pipe(csv({ separator: ';' })) // Thabbet dima f-el Notepad (';' wala ',')
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Force Search: Nlawjou f-el row lkol 3la el NS mte3ek
      const item = results.find(row => {
        return Object.values(row).some(val => 
          val && val.toString().trim() === nsToSearch
        );
      });

      if (item) {
        console.log("✅ Trouvé:", item);
        res.json({
          success: true,
          data: {
            ns: nsToSearch,
            user: item['Utilisateur'] || "Inconnu",
            model: item['Type'] || "PC",
            last_date: item['Dernire modification'] || "N/A"
          }
        });
      } else {
        console.log("❌ Non trouvé pour:", nsToSearch);
        res.status(404).json({ success: false, message: "Numéro de série introuvable." });
      }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`Backend MISFAT Khaddem: http://localhost:${PORT}`);
  console.log(`Test: http://localhost:3000/api/search-glpi/SN2149630092`);
  console.log(`=========================================`);
});