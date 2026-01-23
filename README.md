# 🛡️ MISFAT IT-Assets Manager: Secure QR Mapping Solution

A professional Full-Stack IT Inventory solution built for **MISFAT**, featuring a modern UI, real-time QR Code mapping, and secure SQL Server integration.
---

## 📖 1. Introduction
**MISFAT SECURE** est une solution logicielle industrielle développée pour optimiser le cycle de vie du matériel informatique au sein de l'entreprise. Contrairement aux systèmes de gestion classiques, cette plateforme intègre une technologie de **QR Code Mapping** qui lie chaque composant physique à une entrée numérique dynamique dans une base de données centralisée. L'objectif est de réduire de 90% les erreurs de saisie manuelle et de fournir une visibilité instantanée sur l'état du parc.

---

## 🌟 2. Features & Tech Stack

### 💻 Frontend (React.js)
Nous avons utilisé des fonctionnalités avancées de React pour garantir une interface fluide et réactive :
* ⚡ **`useState` :** Crucial pour gérer l'état local des composants (ex: stocker les résultats de recherche, gérer le texte des inputs).
* 🔄 **`useEffect` :** Utilisé pour exécuter des effets de bord comme l'initialisation du scanner QR ou les appels API au chargement.
* 🎨 **Bento Grid UI :** Une structure CSS moderne pour organiser les modules de l'application de façon claire.
* 📸 **Html5-Qrcode :** Bibliothèque utilisée pour l'accès direct à la caméra et le décodage des QR Codes.

### ⚙️ Backend & Database
* 🔐 **Secure Auth :** Login system avec des requêtes SQL paramétrées pour bloquer les injections.
* 🛡️ **CORS Middleware :** Pour autoriser la communication sécurisée entre le Frontend et le Backend.
* 🗄️ **SQL Server (mssql) :** Système de gestion de base de données relationnelle pour assurer la persistance des données.

---

## 💻 3. Analyse du Code : API Backend (Node.js)



/**
 * EXPLICATION DE L'API :
 * Cette route reçoit les données du scan QR via le Frontend (React).
 * 1. Elle récupère le Serial Number, le nouveau Statut et le Commentaire.
 * 2. Elle utilise des requêtes paramétrées (@sn, @statut) pour sécuriser la base de données.
 * 3. Elle met à jour la table 'devices_finale' en fonction du Serial Number scanné.
 */

app.post('/api/asset/update', async (req, res) => {
    // Récupération des données envoyées par le client (Frontend)
    const { sn, statut, it_comment } = req.body; 

    try {
        const request = new sql.Request();
        
        // Protection contre les injections SQL (Input Validation)
        request.input('sn', sql.VarChar, sn);
        request.input('statut', sql.VarChar, statut);
        request.input('comment', sql.Text, it_comment);

        // Exécution de la mise à jour dans la table 'devices_finale'
        await request.query(`
            UPDATE devices_finale 
            SET statut = @statut, it_comment = @comment 
            WHERE serial_number = @sn
        `);
        
        // Envoi d'une réponse de succès au Frontend
        res.status(200).json({ success: true, message: "Mise à jour réussie" });

    } catch (err) {
        // Gestion des erreurs de connexion ou de requête
        res.status(500).send("Erreur lors de la mise à jour de la base de données");
    }
});
---

## 🗄️ 4. Structure de la Base de Données (SQL Server)



L'application repose sur une base de données **Relational SQL** structurée avec deux tables principales pour assurer la sécurité et la traçabilité :

### 🔹 Table `users` (Authentification)
Utilisée par le Backend pour vérifier les identifiants lors de la connexion.
* **`username`** : Nom d'utilisateur unique.
* **`password`** : Mot de passe sécurisé pour l'accès au tableau de bord.

### 🔹 Table `devices_finale` (Gestion des Assets)
C'est le cœur du système où toutes les données techniques sont stockées.
* **`serial_number` (PK)** : Identifiant unique scanné via le QR Code.
* **`nom_device`** : Type de matériel (PC, Imprimante, Scanner, etc.).
* **`statut`** : État actuel (En service, En stock, Maintenance).
* **`it_comment`** : Historique technique et remarques de l'administrateur.

---
## 📊 5. Diagramme de Flux du Système



```text
[ UTILISATEUR ] 
      | (Scan QR via Html5-Qrcode / gestion via useState)
      ▼
[ FRONTEND (React) ] 
      | (Requête asynchrone API Fetch/Axios)
      ▼
[ BACKEND (Node.js/Express) ] 
      | (Validation des inputs & Requête SQL Paramétrée)
      ▼
[ DATABASE (SQL Server) ] <--- Persistance & Stockage des données
;
---
```
---

## 🛠️ 6. Installation Guide (Setup)

Pour installer et lancer le projet rapidement, copiez et exécutez ces commandes dans votre terminal :

```bash
# Step 1: Clone le projet et entrer dans le dossier
git clone [https://github.com/trabelsiwala047/mon-projet-qr.git](https://github.com/trabelsiwala047/mon-projet-qr.git)
cd mon-projet-qr

# Step 2: Installer toutes les dépendances (Backend & Frontend)
npm install

# Step 3: Lancer l'application (Ouvrez deux terminaux)
# Terminal 1:
node backend/server.js
# Terminal 2:
npm run dev
---

---

## 👤 Contact & Support

Si vous avez des questions, des suggestions ou si vous souhaitez collaborer sur ce projet, n'hésitez pas à me contacter :

* 💼 **Développeur :** Wala Trabelsi
* 🏢 **Rôle :** Full Stack Developer @ **MISFAT IT Department**
* 📧 **Email :** [trabelsiwala047@gmail.com](mailto:trabelsiwal047@gmail.com)
* 🔗 **GitHub :** [trabelsiwala047](https://github.com/trabelsiwala047)

---
⭐ **Si vous trouvez ce projet utile, n'oubliez pas de lui donner une étoile sur GitHub !** ⭐
