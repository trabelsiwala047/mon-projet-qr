const express = require('express');
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Route bch yasnā el QR
app.post('/generate-qr', async (req, res) => {
    const { usr, ns, model, dept } = req.body;
    // El m3atiet elli bch ykounou f-west el QR
    const dataString = `USR: ${usr}\nNS: ${ns}\nModel: ${model}\nDept: ${dept}`;

    try {
        const qrImage = await QRCode.toDataURL(dataString);
        res.json({ qrCodeUrl: qrImage });
    } catch (err) {
        res.status(500).json({ error: 'Erreur de génération' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Backend khaddem ala: http://localhost:${PORT}`);
});