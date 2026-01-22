const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const readline = require('readline');

// ⚙️ Configuration SQL Server (Kima mta' server.js)
const dbConfig = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=DESKTOP-7MGLSR7;Database=ms_devices;Trusted_Connection=yes;',
};

async function setupAndImport() {
    try {
        console.log("⏳ Connexion à SQL Server en cours...");
        const pool = await sql.connect(dbConfig);
        console.log("✅ Connexion réussie !");

        // 🛠️ 1. Création de la table avec la colonne 'comment' par défaut 'Init'
        const createTableQuery = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='devices_finale' AND xtype='U')
            BEGIN
                CREATE TABLE devices_finale (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    Device_Name VARCHAR(255),
                    Type VARCHAR(255),
                    State VARCHAR(255),
                    Serial_Number VARCHAR(255) UNIQUE,
                    user_name VARCHAR(255),
                    comment VARCHAR(MAX) DEFAULT 'Init'
                )
                console.log("🛠️ Table 'devices_finale' créée.");
            END
            ELSE
            BEGIN
                console.log("ℹ️ Table 'devices_finale' existe déjà.");
            END
        `;

        await pool.request().query(createTableQuery);

        // 📥 2. Lancer l'importation
        await startImport(pool);

    } catch (err) {
        console.error("❌ Erreur:", err.message);
    }
}

async function startImport(pool) {
    console.log("⏳ Lecture du fichier glpi.csv...");
    
    // Thabbet elli glpi.csv mawjoud fi nafs el dossier mta' test_db.js
    if (!fs.existsSync('glpi.csv')) {
        console.error("❌ Erreur: Le fichier 'glpi.csv' est introuvable !");
        await sql.close();
        return;
    }

    const fileStream = fs.createReadStream('glpi.csv');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let count = 0;
    let isHeader = true;

    for await (const line of rl) {
        if (isHeader) { isHeader = false; continue; } // Ignorer l'entête du CSV

        // On sépare par point-virgule (;) kima l-export mta' GLPI
        const col = line.split(';'); 
        
        const deviceName = col[0] ? col[0].trim() : 'N/A';
        const type       = col[5] ? col[5].trim() : 'N/A';
        const state      = col[7] ? col[7].trim() : 'N/A';
        const sn         = col[8] ? col[8].trim() : 'N/A';
        const userName   = col[3] ? col[3].trim() : 'N/A';
        const initialComment = 'Init'; // Faza elli t'fahemna fiha

        if (sn === 'N/A' || sn === '') continue; // Skip ken mafamach Serial Number

        try {
            // Requête SQL Server : On insère seulement si le Serial_Number n'existe pas
            await pool.request()
                .input('name', sql.VarChar, deviceName)
                .input('type', sql.VarChar, type)
                .input('state', sql.VarChar, state)
                .input('sn', sql.VarChar, sn)
                .input('user', sql.VarChar, userName)
                .input('comm', sql.VarChar, initialComment)
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM devices_finale WHERE Serial_Number = @sn)
                    BEGIN
                        INSERT INTO devices_finale (Device_Name, Type, State, Serial_Number, user_name, comment)
                        VALUES (@name, @type, @state, @sn, @user, @comm)
                    END
                `);
            count++;
            
            // Afficher le progrès tous les 50 lignes
            if (count % 50 === 0) console.log(`Processed ${count} lines...`);

        } catch (err) {
            // Optionnel: console.log(`Skipped SN ${sn}: ${err.message}`);
        }
    }

    console.log(`\n✅ IMPORTATION TERMINÉE !`);
    console.log(`📊 Total lignes insérées ou vérifiées: ${count}`);
    
    await sql.close();
    process.exit();
}

// Lancer le script
setupAndImport();