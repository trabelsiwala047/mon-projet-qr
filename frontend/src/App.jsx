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

  // --- RECHERCHE ENRICHIE (FIXED) ---
  const handleSearch = async (sn) => {
    const targetSN = sn || searchTerm;
    if (!targetSN) return;
    try {
      // ✅ Testa3mel Backticks s-hi7a hna
      const res = await fetch(`http://localhost:3000/api/search-glpi/${targetSN.trim()}`);
      const result = await res.json();
      if (result.success) { 
        setSearchResult(result.data); 
        setShowActionZone(false); 
      } else { 
        setSearchResult(null); 
        alert('Asset non trouvé dans le fichier CSV'); 
      }
    } catch (err) { alert('Erreur serveur: Verifier que le backend est lancé'); }
  };

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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCredentials({ username: '', password: '' });
    setGenData({ usr: '', ns: '', model: '', dept: '' });
    setQrCodeUrl('');
    setSearchResult(null);
    setShowActionZone(false);
    setSearchTerm('');
    setIsScanning(false);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${qrCodeUrl}" style="width:6cm;height:6cm;image-rendering:pixelated;" onload="window.print();window.close();"/></body></html>`);
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
          .btn-logout-dark { width: 100%; padding: 14px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 15px; font-weight: 700; cursor: pointer; }
          .btn-action-green { width: 100%; padding: 18px; background: #10b981; color: #fff; border: none; border-radius: 18px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
          .btn-action-green:disabled { background: #f1f5f9; color: #cbd5e1; cursor: not-allowed; }
          .input-bento { width: 100%; padding: 16px; border-radius: 15px; border: 2px solid #f1f5f9; background: #f8fafc; font-size: 14px; transition: 0.2s; }
          .input-bento:focus { border-color: #3b82f6; background: #fff; }
          .scan-btn { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 20px; }
          .badge { padding: 5px 12px; border-radius: 10px; font-size: 11px; font-weight: 700; }
          .badge-blue { background: #eff6ff; color: #2563eb; }
          .badge-green { background: #f0fdf4; color: #16a34a; }
          .badge-gray { background: #f1f5f9; color: #64748b; }
          .data-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
          .data-table th { color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 0 15px; text-align: left; }
          .data-table td { background: #fff; padding: 20px 15px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b; }
          .data-table td:first-child { border-left: 1px solid #f1f5f9; border-radius: 15px 0 0 15px; }
          .data-table td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 15px 15px 0; }
        `}
      </style>

      <aside style={styles.sideMenu}>
        <div style={styles.sideBrand}><div style={styles.brandBox}>M</div><span style={{fontWeight:900, fontSize:'22px', color:'#fff', letterSpacing:'-1px'}}>MISFAT</span></div>
        <nav style={{padding:'0 20px', flex:1}}>
          <button onClick={()=>setActiveTab('generate')} className={`nav-pill ${activeTab==='generate'?'active':''}`}>🏷️ Stickers Hub</button>
          <button onClick={()=>setActiveTab('search')} className={`nav-pill ${activeTab==='search'?'active':''}`}>🔍 Smart Search</button>
        </nav>
        <div style={{padding:'20px'}}><button onClick={handleLogout} className="btn-logout-dark">🚪 Déconnexion</button></div>
      </aside>

      <main style={styles.content}>
        <h1 style={{fontSize:'32px', fontWeight:900, color:'#111827', marginBottom:'35px'}}>{activeTab==='generate' ? 'Générateur de QR' : 'Explorateur GLPI'}</h1>

        {activeTab === 'generate' ? (
          <div className="bento-card">
            <div style={styles.bentoGrid}>
              {[{id:'usr', l:'Propriétaire (Usager)'}, {id:'ns', l:'S/N (Code)'}, {id:'model', l:'Modèle'}, {id:'dept', l:'Entité/Site'}].map((item) => (
                <div key={item.id}>
                  <label style={styles.bentoLabel}>{item.l}</label>
                  <input className="input-bento" value={genData[item.id]} onChange={(e)=>setGenData({...genData, [item.id]:e.target.value})} />
                </div>
              ))}
            </div>
            <button disabled={!isFormValid} onClick={async () => {
              const res = await fetch('http://localhost:3000/generate-qr', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(genData) });
              const d = await res.json(); setQrCodeUrl(d.qrCodeUrl);
            }} className="btn-action-green">
              {isFormValid ? '✨ GÉNÉRER L\'ÉTIQUETTE QR' : '🔒 REMPLIR TOUS LES CHAMPS'}
            </button>
            {qrCodeUrl && (
              <div style={{textAlign: 'center', marginTop: '40px'}}>
                <div style={styles.qrGlass}><img src={qrCodeUrl} style={{width:'200px'}} alt="QR Code" /></div>
                <div style={{marginTop: '25px'}}>
                   <button onClick={handlePrint} className="btn-action-green" style={{width:'auto', padding:'15px 50px', margin: '0 auto'}}>🖨️ IMPRIMER L'ÉTIQUETTE</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="bento-card" style={{padding:'25px 35px'}}>
              <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                <div style={{position:'relative', flex:1}}>
                  <input className="input-bento" placeholder="Scanner un sticker ou saisir S/N..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
                  <button onClick={()=>setIsScanning(!isScanning)} className="scan-btn">{isScanning ? '✕' : '📸'}</button>
                </div>
                <button onClick={()=>handleSearch()} style={styles.btnSearch}>TROUVER L'ASSET</button>
              </div>
              {isScanning && <div id="reader" style={{marginTop:'20px', borderRadius:'20px', overflow:'hidden', border:'2px solid #f1f5f9'}}></div>}
            </div>

            {searchResult && (
              <div style={{marginTop:'35px'}}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Info / Usager</th><th>S/N Code</th><th>Modèle / Fabricant</th><th>📍 État</th><th>🏢 Entité</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{fontWeight:800}}>{searchResult.user || "N/A"}</td>
                      <td><span className="badge badge-gray" style={{fontFamily:'monospace'}}>{searchResult.ns}</span></td>
                      <td>
                        <div style={{fontWeight:700}}>{searchResult.model}</div>
                        <div style={{fontSize:'11px', color:'#94a3b8'}}>{searchResult.entity}</div>
                      </td>
                      <td><span className="badge badge-blue">{searchResult.status}</span></td>
                      <td><span className="badge badge-green">MISFAT</span></td>
                      <td><button onClick={()=>setShowActionZone(true)} style={styles.btnMiniValider}>VALIDER</button></td>
                    </tr>
                  </tbody>
                </table>

                {showActionZone && (
                  <div className="bento-card" style={{marginTop:'25px', border:'2px solid #3b82f6', background: '#fcfdfe'}}>
                    <div style={{display:'flex', gap:'30px'}}>
                      <div style={{flex:1}}>
                        <label style={styles.bentoLabel}>CHANGER L'ÉTAT</label>
                        <select className="input-bento" value={selectedStatus} onChange={(e)=>setSelectedStatus(e.target.value)}>
                          <option>✅ En service</option>
                          <option>📦 En stock</option>
                          <option>⚠️ En panne</option>
                          <option>🔧 Maintenance</option>
                        </select>
                      </div>
                      <div style={{flex:1.5}}>
                        <label style={styles.bentoLabel}>COMMENTAIRE IT (HISTORIQUE)</label>
                        <textarea className="input-bento" style={{height:'90px', resize:'none'}} placeholder="Détails techniques..." value={comment} onChange={(e)=>setComment(e.target.value)} />
                      </div>
                    </div>
                    <div style={{textAlign:'right', marginTop:'25px'}}>
                      <button onClick={()=>{
                        setActiveTab('generate'); 
                        setGenData({
                          usr: searchResult.user, 
                          ns: searchResult.ns, 
                          model: searchResult.model, 
                          dept: searchResult.entity
                        }); 
                        setQrCodeUrl('');
                      }} style={styles.btnFinal}>CONFIRMER & ALLER AU GÉNÉRATEUR</button>
                    </div>
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

// Les styles restent les mêmes que les tiens
const styles = {
  layout: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sideMenu: { width: '280px', background: '#111827', display: 'flex', flexDirection: 'column' },
  sideBrand: { padding: '45px 30px', display: 'flex', alignItems: 'center', gap: '15px' },
  brandBox: { width:'42px', height:'42px', background:'#3b82f6', borderRadius:'12px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'20px' },
  content: { flex: 1, padding: '40px 60px', overflowY: 'auto' },
  bentoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' },
  bentoLabel: { fontSize: '11px', fontWeight: 900, color: '#94a3b8', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' },
  qrGlass: { display: 'inline-block', padding: '25px', background: '#fff', borderRadius: '35px', border: '1px solid #f1f5f9', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' },
  btnSearch: { padding: '0 35px', height:'55px', background: '#111827', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: 800, cursor: 'pointer' },
  btnMiniValider: { padding: '10px 22px', background: '#111827', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize:'11px' },
  btnFinal: { padding: '16px 35px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '15px', fontWeight: 800, cursor: 'pointer' },
  loginPage: { height:'100vh', width:'100vw', display:'flex', justifyContent:'center', alignItems:'center', background:'#f0f2f5' },
  loginCard: { background:'#111827', padding:'60px', borderRadius:'45px', width:'420px', textAlign:'center' },
  loginLogo: { width:'70px', height:'70px', background:'#3b82f6', borderRadius:'20px', margin:'0 auto 25px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', fontWeight:900 },
  loginInput: { width:'100%', padding:'18px', borderRadius:'15px', border:'none', background:'rgba(255,255,255,0.05)', color:'#fff', textAlign:'center' },
  btnAuth: { width:'100%', marginTop:'25px', padding:'18px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'15px', fontWeight:900 }
};

export default App;