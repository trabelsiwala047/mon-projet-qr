const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const readline = require('readline');

const db = new sqlite3.Database('./misfat.db');

async function importFinalCorrected() {
    db.serialize(() => {
        db.run("DROP TABLE IF EXISTS assets");
        db.run("CREATE TABLE assets (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT, model TEXT, statut TEXT, sn TEXT, user TEXT)");
    });

    const fileStream = fs.createReadStream('glpi.csv');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let count = 0;
    let isHeader = true;
    db.run("BEGIN TRANSACTION");

    for await (const line of rl) {
        if (isHeader) { isHeader = false; continue; }

        const col = line.split(';'); 
        
        const query = `INSERT INTO assets (nom, model, statut, sn, user) VALUES (?, ?, ?, ?, ?)`;
        
        // --- UTILISATION DES INDICES VÉRIFIÉS ---
        db.run(query, [
            col[0] || 'N/A', // ID/Nom
            col[5] || 'N/A', // Modèle (Mini Pc GIGABYTE)
            col[7] || 'N/A', // Statut (En Service)
            col[8] || 'N/A', // S/N (SN2149630092)
            col[3] || 'N/A'  // Usager (Consult)
        ]);

        count++;
        if (count >= 1300) break; 
    }

    db.run("COMMIT", () => {
        console.log(`---`);
        console.log(`✅ IMPORTATION RÉUSSIE AVEC LES BONS INDICES !`);
        console.log(`📊 ${count} assets importés.`);
        db.close();
    });
}

importFinalCorrected();