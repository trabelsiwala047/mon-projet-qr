import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('generate');
  const [genData, setGenData] = useState({ usr: '', ns: '', model: '', dept: '' });
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showActionZone, setShowActionZone] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('En service');
  const [comment, setComment] = useState('');

  const isFormValid = genData.usr && genData.ns && genData.model && genData.dept;

  // --- 1. FONCTION RECHERCHE ---
  const handleSearch = async (sn) => {
    const targetSN = sn || searchTerm;
    if (!targetSN) return;
    try {
      const res = await fetch(`http://localhost:3001/api/asset/${targetSN.trim()}`);
      if (res.ok) {
        const result = await res.json();
        setSearchResult(result);
        setSelectedStatus(result.statut);
        setShowActionZone(false);
      } else {
        alert('Asset non trouvé !');
      }
    } catch (err) { alert('Erreur connection Backend (3001)'); }
  };

  // --- 2. FONCTION UPDATE SQL ---
  const handleConfirmUpdate = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/asset/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sn: searchResult.sn, statut: selectedStatus })
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Statut baddelneh fil base !");
        setSearchResult({ ...searchResult, statut: selectedStatus });
        setGenData({
          usr: searchResult.user,
          ns: searchResult.sn,
          model: searchResult.model,
          dept: searchResult.nom
        });
        setActiveTab('generate');
      }
    } catch (err) { alert("❌ Problème de connexion."); }
  };

  // --- 3. GESTION SCANNER CAMERA ---
  useEffect(() => {
    let scanner = null;
    if (isLoggedIn && isScanning && activeTab === 'search') {
      scanner = new Html5QrcodeScanner("reader", { fps: 20, qrbox: 250 });
      scanner.render((decodedText) => {
        setSearchTerm(decodedText);
        handleSearch(decodedText);
        setIsScanning(false);
        scanner.clear();
      }, (err) => {});
    }
    return () => { if (scanner) scanner.clear().catch(e => {}); };
  }, [isScanning, activeTab, isLoggedIn]);

  const handleLogout = () => { setIsLoggedIn(false); setCredentials({ username: '', password: '' }); };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${qrCodeUrl}" style="width:6cm;height:6cm;" onload="window.print();window.close();"/></body></html>`);
    printWindow.document.close();
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.loginLogo}>M</div>
          <h2 style={{color:'#fff', fontWeight:900, marginBottom:'30px'}}>MISFAT PORTAL</h2>
          <form onSubmit={(e) => { e.preventDefault(); if(credentials.username === 'admin' && credentials.password === 'misfat2026') setIsLoggedIn(true); else alert('Erreur'); }}>
            <input type="text" placeholder="Utilisateur" style={styles.loginInput} value={credentials.username} onChange={(e)=>setCredentials({...credentials, username:e.target.value})} />
            <input type="password" placeholder="Mot de passe" style={{...styles.loginInput, marginTop:'15px'}} value={credentials.password} onChange={(e)=>setCredentials({...credentials, password:e.target.value})} />
            <button type="submit" style={styles.btnAuth}>AUTHENTIFICATION</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <style>
        {`
          @import url('https://rsms.me/inter/inter.css');
          * { font-family: 'Inter', sans-serif; box-sizing: border-box; outline: none; }
          body { background: #f8fafc; margin: 0; }
          .bento-card { background: #fff; border-radius: 30px; padding: 35px; box-shadow: 0 15px 35px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
          .nav-pill { padding: 15px 25px; margin: 5px 0; border-radius: 15px; border: none; background: transparent; color: #9ca3af; font-weight: 600; cursor: pointer; width: 100%; text-align: left; transition: 0.3s; display: flex; align-items: center; gap: 10px; }
          .nav-pill.active { color: #fff; background: #3b82f6; }
          .btn-action-green { width: 100%; padding: 18px; background: #10b981; color: #fff; border: none; border-radius: 18px; font-weight: 800; cursor: pointer; }
          .input-bento { width: 100%; padding: 16px; border-radius: 15px; border: 2px solid #f1f5f9; background: #f8fafc; }
          .scan-btn { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 20px; }
          .data-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
          .data-table th { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 0 15px; text-align: left; }
          .data-table td { background: #fff; padding: 20px 15px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
          .badge { padding: 5px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; }
        `}
      </style>

      <aside style={styles.sideMenu}>
        <div style={styles.sideBrand}><div style={styles.brandBox}>M</div><span style={{fontWeight:900, fontSize:'22px', color:'#fff'}}>MISFAT</span></div>
        <nav style={{padding:'0 20px', flex:1}}>
          <button onClick={()=>setActiveTab('generate')} className={`nav-pill ${activeTab==='generate'?'active':''}`}>🏷️ Stickers Hub</button>
          <button onClick={()=>setActiveTab('search')} className={`nav-pill ${activeTab==='search'?'active':''}`}>🔍 Smart Search</button>
        </nav>
        <div style={{padding:'20px'}}><button onClick={handleLogout} style={styles.btnLogOut}>🚪 Déconnexion</button></div>
      </aside>

      <main style={styles.content}>
        <h1 style={{fontSize:'32px', fontWeight:900, marginBottom:'35px'}}>{activeTab==='generate' ? 'Générateur de QR' : 'Explorateur GLPI'}</h1>

        {activeTab === 'generate' ? (
          <div className="bento-card">
            <div style={styles.bentoGrid}>
              {[{id:'usr', l:'Usager'}, {id:'ns', l:'S/N'}, {id:'model', l:'Modèle'}, {id:'dept', l:'Entité'}].map((item) => (
                <div key={item.id}>
                  <label style={styles.bentoLabel}>{item.l}</label>
                  <input className="input-bento" value={genData[item.id]} onChange={(e)=>setGenData({...genData, [item.id]:e.target.value})} />
                </div>
              ))}
            </div>
            <button disabled={!isFormValid} onClick={async () => {
              const res = await fetch('http://localhost:3001/generate-qr', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(genData) });
              const d = await res.json(); setQrCodeUrl(d.qrCodeUrl);
            }} className="btn-action-green">
              {isFormValid ? '✨ GÉNÉRER L\'ÉTIQUETTE QR' : '🔒 REMPLIR TOUS LES CHAMPS'}
            </button>
            {qrCodeUrl && <div style={{textAlign:'center', marginTop:'40px'}}><div style={styles.qrGlass}><img src={qrCodeUrl} style={{width:'200px'}} /></div><br/><button onClick={handlePrint} className="btn-action-green" style={{width:'auto', marginTop:'20px'}}>🖨️ IMPRIMER</button></div>}
          </div>
        ) : (
          <div>
            <div className="bento-card" style={{padding:'25px 35px'}}>
              <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                <div style={{position:'relative', flex:1}}>
                  <input className="input-bento" placeholder="Scanner ou saisir S/N..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
                  <button onClick={()=>setIsScanning(!isScanning)} className="scan-btn">{isScanning ? '✕' : '📸'}</button>
                </div>
                <button onClick={()=>handleSearch()} style={styles.btnSearch}>TROUVER L'ASSET</button>
              </div>
              {isScanning && <div id="reader" style={{marginTop:'20px', borderRadius:'20px', overflow:'hidden'}}></div>}
            </div>

            {searchResult && (
              <div style={{marginTop:'35px'}}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Usager</th><th>S/N Code</th><th>Modèle</th><th>📍 État</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{fontWeight:800}}>{searchResult.user}</td>
                      <td><span className="badge" style={{background:'#f1f5f9'}}>{searchResult.sn}</span></td>
                      <td>{searchResult.model}</td>
                      <td><span className="badge" style={{background:'#eff6ff', color:'#2563eb'}}>{searchResult.statut}</span></td>
                      <td><button onClick={()=>setShowActionZone(true)} style={styles.btnMiniValider}>VALIDER</button></td>
                    </tr>
                  </tbody>
                </table>

                {showActionZone && (
                  <div className="bento-card" style={{marginTop:'25px', border:'2px solid #3b82f6'}}>
                    <div style={{display:'flex', gap:'30px'}}>
                      <div style={{flex:1}}>
                        <label style={styles.bentoLabel}>CHANGER L'ÉTAT</label>
                        <select className="input-bento" value={selectedStatus} onChange={(e)=>setSelectedStatus(e.target.value)}>
                          <option value="En service">✅ En service</option>
                          <option value="En stock">📦 En stock</option>
                          <option value="En panne">⚠️ En panne</option>
                          <option value="Maintenance">🔧 Maintenance</option>
                        </select>
                      </div>
                      <div style={{flex:1.5}}>
                        <label style={styles.bentoLabel}>COMMENTAIRE IT</label>
                        <textarea className="input-bento" style={{height:'80px'}} value={comment} onChange={(e)=>setComment(e.target.value)} />
                      </div>
                    </div>
                    <button onClick={handleConfirmUpdate} style={{...styles.btnFinal, marginTop:'20px'}}>💾 CONFIRMER & GÉNÉRER STICKER</button>
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

const styles = {
  layout: { display: 'flex', height: '100vh' },
  sideMenu: { width: '280px', background: '#111827', display: 'flex', flexDirection: 'column' },
  sideBrand: { padding: '45px 30px', display: 'flex', alignItems: 'center', gap: '15px' },
  brandBox: { width:'42px', height:'42px', background:'#3b82f6', borderRadius:'12px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 },
  content: { flex: 1, padding: '40px 60px', overflowY: 'auto' },
  bentoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' },
  bentoLabel: { fontSize: '11px', fontWeight: 900, color: '#94a3b8', marginBottom: '8px', display: 'block', textTransform: 'uppercase' },
  btnSearch: { padding: '0 35px', height:'55px', background: '#111827', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: 800, cursor: 'pointer' },
  btnMiniValider: { padding: '10px 22px', background: '#111827', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' },
  btnFinal: { width:'100%', padding: '16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 800, cursor: 'pointer' },
  qrGlass: { display: 'inline-block', padding: '20px', background: '#fff', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  loginPage: { height:'100vh', width:'100vw', display:'flex', justifyContent:'center', alignItems:'center', background:'#f0f2f5' },
  loginCard: { background:'#111827', padding:'60px', borderRadius:'45px', width:'420px', textAlign:'center' },
  loginLogo: { width:'70px', height:'70px', background:'#3b82f6', borderRadius:'20px', margin:'0 auto 20px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', fontWeight:900 },
  loginInput: { width:'100%', padding:'18px', borderRadius:'15px', border:'none', background:'rgba(255,255,255,0.05)', color:'#fff' },
  btnAuth: { width:'100%', marginTop:'25px', padding:'18px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'15px', fontWeight:900 },
  btnLogOut: { width:'100%', padding:'12px', background:'rgba(239, 68, 68, 0.1)', color:'#ef4444', border:'1px solid rgba(239, 68, 68, 0.2)', borderRadius:'12px', fontWeight:700, cursor:'pointer' }
};

export default App;