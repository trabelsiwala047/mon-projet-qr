const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate-qr', async (req, res) => {
    const { usr, ns, model, dept } = req.body;
    const dataString = `USR: ${usr}\nNS: ${ns}\nModel: ${model}\nDept: ${dept}`;
    try {
        // HEDHI EL FAZA EL GARANTIE:
        const qrDataUrl = await QRCode.toDataURL(dataString);
        res.json({ qrCodeUrl: qrDataUrl });
    } catch (err) {
        res.status(500).json({ error: 'Erreur' });
    }
});

app.listen(3000, () => console.log("✅ Backend Ready on 3000"));