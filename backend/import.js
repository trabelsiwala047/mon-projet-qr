const fs = require('fs');
const csv = require('csv-parser');
const oracledb = require('oracledb');

// 1. Initialisation mta3 el Oracle Client (Thabbet f-el thneya mte3ek)
try {
  oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_19_29' });
  console.log("✅ Oracle Client initialisé.");
} catch (err) {
  console.error("❌ Erreur Client Oracle:", err.message);
  process.exit(1);
}

// 2. Paramètres mta3 el Connection
const dbConfig = {
  user: "misfat_user",
  password: "misfat123",
  connectString: "localhost:1521/XE"
};

async function run() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log("✅ Connecté à Oracle avec succès!");

    const results = [];

    // 3. 9rayet el fichier glpi.csv
    console.log("⏳ Lecture du fichier glpi.csv...");
    
    fs.createReadStream('glpi.csv')
      .pipe(csv({ separator: ';' })) // separator ";" khater CSV tounes dima haka
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`📊 ${results.length} lignes trouvées. Start insertion...`);

        for (const row of results) {
          try {
            const sql = `INSERT INTO assets (sn, name, category, location, status) 
                         VALUES (:sn, :name, :category, :location, :status)`;
            
            const binds = {
              sn: row['NumŽro de sŽrie'] || 'N/A',
              name: row['Nom'] || 'Sans Nom',
              category: row['Type'] || 'Inconnu',
              location: row['EntitŽ'] || 'Misfat',
              status: row['Statut'] || 'Actif'
            };

            await connection.execute(sql, binds, { autoCommit: true });
            console.log(`✔️ SN: ${binds.sn} importé.`);

          } catch (err) {
            console.error(`❌ Erreur sur la ligne ${row['NumŽro de sŽrie']}:`, err.message);
          }
        }

        console.log("🚀 Tout est terminé !");
        await connection.close();
        process.exit(0);
      })
      .on('error', (err) => {
        console.error("❌ Erreur de lecture CSV:", err.message);
      });

  } catch (err) {
    console.error("❌ Erreur de connexion:", err.message);
  }
}

run();