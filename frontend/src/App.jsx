
import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeCanvas } from 'qrcode.react';

function App() {
  // --- STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');

  // States Générateur (Kima el version el 9dima)
  const [genData, setGenData] = useState({ usr: '', ns: '', model: '' });
  const [qrVisible, setQrVisible] = useState(false);

  // States Recherche & Update
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showActionZone, setShowActionZone] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('En service');
  const [itComment, setItComment] = useState('');

  // --- 🔐 LOGIN FUNCTION ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (data.success) {
        setIsLoggedIn(true);
      } else {
        setShowErrorModal(true); // Tatla3 el modal "Alert !!"
      }
    } catch (err) {
      alert("❌ Erreur: Backend mouch khaddem (Port 3001)");
    }
  };

  // --- 🏷️ GENERATEUR FUNCTIONS ---
  const handleGenerate = () => {
    if (genData.ns) setQrVisible(true);
    else setShowErrorModal(true); 
  };

  const handlePrint = () => {
    const canvas = document.getElementById("qr-gen");
    const url = canvas.toDataURL();
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head><title>Imprimer Sticker</title></head>
        <body style="display:flex; justify-content:center; align-items:center; height:100vh; margin:0; flex-direction:column; font-family:sans-serif;">
          <img src="${url}" style="width:250px; height:250px;"/>
          <h2 style="margin-top:10px;">${genData.ns}</h2>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // --- 🔍 SEARCH & UPDATE FUNCTIONS ---
  const handleSearch = async (sn) => {
    const targetSN = sn || searchTerm;
    if (!targetSN) return;
    try {
      const res = await fetch(`http://localhost:3001/api/asset/${targetSN.trim()}`);
      if (res.ok) {
        const result = await res.json();
        setSearchResult(result);
        setSelectedStatus(result.statut || 'En service');
        setItComment(result.comment || 'Init');
        setShowActionZone(false);
      } else {
        alert('Asset non trouvé dans la base');
      }
    } catch (err) { alert('Erreur de connexion au serveur'); }
  };

  const handleConfirmUpdate = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/asset/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sn: searchResult.sn, statut: selectedStatus, it_comment: itComment })
      });
      if (res.ok) {
        alert("✅ Données mises à jour avec succès!");
        handleSearch(searchResult.sn);
        setShowActionZone(false);
      }
    } catch (err) { alert("❌ Erreur lors de l'enregistrement"); }
  };

  // --- 📸 SCANNER EFFECT ---
  useEffect(() => {
    let scanner = null;
    if (isLoggedIn && isScanning && activeTab === 'search') {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((text) => {
        setSearchTerm(text);
        handleSearch(text);
        setIsScanning(false);
        scanner.clear();
      }, () => {});
    }
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [isScanning, activeTab, isLoggedIn]);

  // --- 🚪 UI: LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        {showErrorModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.errorModal}>
              <div style={styles.errorIcon}>!</div>
              <h1 style={{color:'#111827', margin:'10px 0'}}>Alert !!</h1>
              <p style={{color:'#6b7280', marginBottom:'20px', fontSize:'18px'}}>Verifier login ou password</p>
              <button onClick={() => setShowErrorModal(false)} style={styles.btnRetry}>Réessayer</button>
            </div>
          </div>
        )}
        <div style={styles.loginCard}>
          <div style={styles.loginLogo}>M</div>
          <h2 style={{color:'#fff', marginBottom:'30px', letterSpacing:'2px'}}>MISFAT SECURE</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Utilisateur" style={styles.loginInput} value={credentials.username} onChange={(e)=>setCredentials({...credentials, username:e.target.value})} required />
            <input type="password" placeholder="Mot de passe" style={{...styles.loginInput, marginTop:'15px'}} value={credentials.password} onChange={(e)=>setCredentials({...credentials, password:e.target.value})} required />
            <button type="submit" style={styles.btnAuth}>LOGIN</button>
          </form>

import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// --- 1. PAGE LOGIN ---
const LoginPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === "admin" && pass === "admin") {
      navigate('/generator');
    } else {
      alert("Identifiants incorrects (admin / admin)");
    }
  };

  return (
    <div style={st.container}>
      <div style={st.glassCard}>
        <div style={st.headerSection}>
          <div style={st.mainLogo}>MISFAT <span style={{color: '#60a5fa'}}>QR</span></div>
          <div style={st.separator}></div>
          <p style={st.tagline}>SECURE ACCESS GATEWAY</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={st.field}>
            <label style={st.label}>IDENTIFIANT</label>
            <input 
              type="text" 
              style={st.glassInput} 
              placeholder="Nom d'utilisateur" 
              onChange={e => setUser(e.target.value)} 
            />
          </div>
          <div style={st.field}>
            <label style={st.label}>MOT DE PASSE</label>
            <input 
              type="password" 
              style={st.glassInput} 
              placeholder="••••••••" 
              onChange={e => setPass(e.target.value)} 
            />
          </div>
          <button type="submit" style={st.glowBtn}>LOG IN</button>
        </form>
      </div>
    </div>
  );
};

// --- 2. PAGE GENERATOR ---
const GeneratorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ usr: '', ns: '', model: '', dept: '' });
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [showQR, setShowQR] = useState(false);

  const generateQR = async () => {
    if(!formData.usr || !formData.ns) {
      alert("Veuillez remplir les champs obligatoires");
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:3000/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setQrImageUrl(data.qrCodeUrl);
      setShowQR(true);
    } catch (err) {
      alert("Erreur: Le serveur (Backend) ne répond pas!");
    }
  };

  if (showQR) {
    return (
      <div style={st.container}>
        {/* CSS Media Query bch nakhfiw el boutons wa9t el Print */}
        <style>
          {`
            @media print {
              .no-print { display: none !important; }
              body { background: white !important; padding: 0 !important; margin: 0 !important; }
              .printable-card { 
                box-shadow: none !important; 
                border: none !important; 
                background: white !important;
                backdrop-filter: none !important;
                margin: 0 auto !important;
                padding: 0 !important;
                width: 100% !important;
              }
              .qr-container-print { padding: 0 !important; border: none !important; }
            }
          `}
        </style>

        <div style={st.glassCard} className="printable-card">
          <div style={st.qrContainer} className="qr-container-print">
            <img src={qrImageUrl} alt="QR" style={st.qrDisplay} />
          </div>
          
          <div className="no-print" style={{display: 'flex', flexDirection: 'column', gap: '15px', width: '100%'}}>
            <button onClick={() => window.print()} style={st.glowBtn}>IMPRIMER LE CODE</button>
            <button onClick={() => setShowQR(false)} style={st.ghostBtn}>RETOUR</button>
          </div>

        </div>
      </div>
    );
  }

  // --- 💻 UI: MAIN APP ---
  return (
    <div style={styles.layout}>
      <aside style={styles.sideMenu}>
        <div style={styles.sideBrand}><div style={styles.brandBox}>M</div><span style={{color:'#fff', fontWeight:900}}>MISFAT</span></div>
        <nav style={{padding:'20px', flex:1}}>
          <button onClick={()=>{setActiveTab('generate'); setQrVisible(false);}} style={activeTab==='generate'?{...styles.navPill, background:'#3b82f6', color:'#fff'}:styles.navPill}>🏷️ Stickers Hub</button>
          <button onClick={()=>setActiveTab('search')} style={activeTab==='search'?{...styles.navPill, background:'#3b82f6', color:'#fff'}:styles.navPill}>🔍 Smart Search</button>
        </nav>
        <div style={{padding:'20px'}}><button onClick={()=>setIsLoggedIn(false)} style={styles.btnLogOut}>🚪 Déconnexion</button></div>
      </aside>

      <main style={styles.content}>
        {activeTab === 'generate' ? (
          <div style={styles.bentoCard}>
            <h2 style={{marginBottom:'25px'}}>🏷️ Générateur de Stickers</h2>
            <div style={{display:'flex', flexDirection:'column', gap:'15px', maxWidth:'500px'}}>
              <input style={styles.inputBento} placeholder="Nom de l'usager" value={genData.usr} onChange={(e)=>setGenData({...genData, usr:e.target.value})} />
              <input style={styles.inputBento} placeholder="S/N (Numéro de série)" value={genData.ns} onChange={(e)=>setGenData({...genData, ns:e.target.value})} />
              <input style={styles.inputBento} placeholder="Modèle de l'appareil" value={genData.model} onChange={(e)=>setGenData({...genData, model:e.target.value})} />
              <button onClick={handleGenerate} style={styles.btnFinal}>GENERER QR CODE</button>
            </div>

            {qrVisible && (
              <div style={styles.qrResultZone}>
                <QRCodeCanvas id="qr-gen" value={genData.ns} size={220} includeMargin={true} />
                <div style={{marginTop:'25px'}}>
                  <button onClick={handlePrint} style={styles.btnPrint}>🖨️ IMPRIMER LE STICKER</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={styles.bentoCard}>
              <div style={{display:'flex', gap:'10px'}}>
                <input style={styles.inputBento} placeholder="Scanner ou taper S/N..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
                <button onClick={()=>setIsScanning(!isScanning)} style={styles.btnSearch}>{isScanning ? '✕' : '📸 Scan'}</button>
                <button onClick={()=>handleSearch()} style={styles.btnSearch}>TROUVER</button>
              </div>
              {isScanning && <div id="reader" style={{marginTop:'20px', borderRadius:'15px', overflow:'hidden'}}></div>}
            </div>

            {searchResult && (
              <div style={{marginTop:'30px'}}>
                <table style={styles.dataTable}>
                  <thead><tr><th>Usager</th><th>S/N</th><th>État</th><th>Commentaire IT</th><th>Action</th></tr></thead>
                  <tbody>
                    <tr>
                      <td>{searchResult.user}</td><td>{searchResult.sn}</td>
                      <td><span style={styles.statusBadge}>{searchResult.statut}</span></td>
                      <td>{searchResult.comment}</td>
                      <td><button onClick={()=>setShowActionZone(true)} style={styles.btnMiniValider}>MODIFIER</button></td>
                    </tr>
                  </tbody>
                </table>
                {showActionZone && (
                  <div style={{...styles.bentoCard, marginTop:'20px', border:'2px solid #3b82f6', animation:'fadeIn 0.3s'}}>
                    <h3>Mise à jour de l'Asset</h3>
                    <select style={{...styles.inputBento, marginTop:'15px'}} value={selectedStatus} onChange={(e)=>setSelectedStatus(e.target.value)}>
                      <option value="En service">En service</option><option value="En stock">En stock</option><option value="En panne">En panne</option>
                    </select>
                    <textarea style={{...styles.inputBento, marginTop:'15px', height:'100px'}} value={itComment} onFocus={()=>itComment==="Init" && setItComment("")} onChange={(e)=>setItComment(e.target.value)} />
                    <button onClick={handleConfirmUpdate} style={{...styles.btnFinal, background:'#10b981', marginTop:'15px'}}>💾 SAUVEGARDER DANS LA BASE</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// --- 🎨 MODERN STYLES ---
const styles = {
  layout: { display: 'flex', height: '100vh', background:'#f1f5f9' },
  sideMenu: { width: '280px', background: '#0f172a', display: 'flex', flexDirection: 'column' },
  sideBrand: { padding: '40px 30px', display: 'flex', alignItems: 'center', gap: '15px' },
  brandBox: { width:'40px', height:'40px', background:'#3b82f6', borderRadius:'10px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'20px' },
  content: { flex: 1, padding: '40px', overflowY: 'auto' },
  navPill: { padding: '15px', margin: '5px 0', borderRadius: '12px', border: 'none', background: 'transparent', color: '#94a3b8', width: '100%', textAlign: 'left', cursor: 'pointer', fontWeight: 600, transition:'0.3s' },
  bentoCard: { background: '#fff', borderRadius: '24px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  inputBento: { width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize:'16px' },
  btnSearch: { padding: '15px 25px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight:600 },
  btnMiniValider: { padding: '10px 18px', background: '#0f172a', color: '#fff', borderRadius: '10px', cursor:'pointer', border:'none' },
  btnFinal: { width:'100%', padding: '18px', background: '#3b82f6', color: '#fff', borderRadius: '12px', fontWeight: 800, border:'none', cursor:'pointer', fontSize:'16px' },
  btnPrint: { padding: '15px 30px', background: '#10b981', color: '#fff', borderRadius: '12px', border:'none', fontWeight:700, cursor:'pointer' },
  qrResultZone: { marginTop:'40px', textAlign:'center', borderTop:'2px dashed #e2e8f0', paddingTop:'30px', animation:'fadeIn 0.5s' },
  dataTable: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' },
  statusBadge: { background: '#dbeafe', color: '#1e40af', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 },
  loginPage: { height:'100vh', width:'100vw', display:'flex', justifyContent:'center', alignItems:'center', background:'#e2e8f0' },
  loginCard: { background:'#0f172a', padding:'60px 40px', borderRadius:'40px', width:'420px', textAlign:'center', boxShadow:'0 25px 50px -12px rgba(0,0,0,0.5)' },
  loginInput: { width:'100%', padding:'18px', borderRadius:'15px', border:'none', background:'rgba(255,255,255,0.05)', color:'#fff', fontSize:'16px' },
  btnAuth: { width:'100%', marginTop:'25px', padding:'18px', background:'#3b82f6', color:'#fff', borderRadius:'15px', fontWeight:900, border:'none', cursor:'pointer', fontSize:'16px' },
  modalOverlay: { position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(15, 23, 42, 0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:9999, backdropFilter:'blur(8px)' },
  errorModal: { background:'#fff', padding:'50px', borderRadius:'35px', textAlign:'center', width:'400px', boxShadow:'0 20px 25px rgba(0,0,0,0.2)' },
  errorIcon: { width:'70px', height:'70px', background:'#ef4444', color:'#fff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', fontWeight:900, margin:'0 auto 20px' },
  btnRetry: { width:'100%', padding:'15px', background:'#0f172a', color:'#fff', border:'none', borderRadius:'15px', cursor:'pointer', fontWeight:800 },
  btnLogOut: { background:'none', border:'1px solid #ef4444', color:'#ef4444', padding:'12px', borderRadius:'12px', width:'100%', cursor:'pointer', fontWeight:600 },
  loginLogo: { width:'70px', height:'70px', background:'#3b82f6', borderRadius:'20px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 25px', fontSize:'32px', fontWeight:900 }
};

export default App;

  return (
    <div style={st.container}>
      <div style={{...st.glassCard, width: '650px'}}>
        <div style={st.topNav}>
          <div style={st.logoSmall}>MISFAT <span style={{color: '#60a5fa'}}>SYSTEM</span></div>
          <button onClick={() => navigate('/')} style={st.exitBtn}>Logout</button>
        </div>
        <div style={st.gridHolder}>
          {['usr', 'ns', 'model', 'dept'].map(f => (
            <div key={f} style={st.field}>
              <label style={st.label}>{f === 'usr' ? 'OPÉRATEUR' : f === 'ns' ? 'NUMÉRO SÉRIE' : f.toUpperCase()}</label>
              <input 
                style={st.glassInput} 
                placeholder={`Saisir ${f}...`} 
                onChange={e => setFormData({...formData, [f]: e.target.value})} 
              />
            </div>
          ))}
        </div>
        <button onClick={generateQR} style={st.glowBtn}>GÉNÉRER QR CODE</button>
      </div>
    </div>
  );
};

// --- 3. EXPORT ---
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/generator" element={<GeneratorPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// --- 4. STYLES ---
const st = {
  container: { 
    height: '100vh', width: '100vw', 
    background: 'radial-gradient(circle at top left, #1e293b, #0f172a, #020617)', 
    display: 'flex', justifyContent: 'center', alignItems: 'center', 
    fontFamily: '"Segoe UI", Roboto, sans-serif', margin: 0, overflow: 'hidden'
  },
  glassCard: { 
    background: 'rgba(30, 41, 59, 0.75)', 
    padding: '50px', borderRadius: '32px', 
    boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)', 
    width: '420px', textAlign: 'center',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  headerSection: { marginBottom: '40px' },
  mainLogo: { fontSize: '40px', fontWeight: '900', color: '#fff', letterSpacing: '-2px' },
  separator: { width: '40px', height: '4px', background: '#3b82f6', margin: '15px auto', borderRadius: '2px' },
  tagline: { fontSize: '10px', color: '#94a3b8', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' },
  field: { textAlign: 'left', marginBottom: '22px' },
  label: { fontSize: '10px', fontWeight: '800', color: '#3b82f6', marginBottom: '8px', display: 'block', letterSpacing: '1px' },
  glassInput: { 
    width: '100%', padding: '16px 20px', background: 'rgba(15, 23, 42, 0.6)', 
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', 
    fontSize: '15px', color: '#fff', outline: 'none', 
    boxSizing: 'border-box'
  },
  glowBtn: { 
    width: '100%', padding: '18px', background: '#3b82f6', 
    color: '#fff', border: 'none', borderRadius: '16px', 
    fontWeight: '800', cursor: 'pointer', fontSize: '14px',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
    textTransform: 'uppercase', letterSpacing: '1px',
    transition: 'all 0.3s ease'
  },
  ghostBtn: { 
    width: '100%', padding: '16px', background: 'transparent', 
    color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '16px', 
    cursor: 'pointer', fontWeight: '600'
  },
  topNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  logoSmall: { color: '#fff', fontWeight: '800', fontSize: '24px', letterSpacing: '-1px' },
  exitBtn: { background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#f87171', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' },
  gridHolder: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '35px' },
  qrContainer: { 
    padding: '30px', background: '#fff', borderRadius: '24px', 
    marginBottom: '35px', boxShadow: '0 0 40px rgba(255,255,255,0.1)' 
  },
  qrDisplay: { width: '260px', height: '260px', display: 'block', margin: '0 auto' }
};

