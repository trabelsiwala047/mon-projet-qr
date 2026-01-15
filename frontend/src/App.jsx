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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>MISFAT - Sticker</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { width: 6cm; height: 6cm; }
          </style>
        </head>
        <body>
          <img src="${qrCodeUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const changeTab = (tabName) => {
    setActiveTab(tabName);
    setQrCodeUrl('');
    setIsScanning(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'misfat2026') {
      setIsLoggedIn(true);
    } else { alert('Accès non autorisé'); }
  };

  const handleSearch = async (sn) => {
    const targetSN = sn || searchTerm;
    if (!targetSN) return;
    try {
      const res = await fetch(`http://localhost:3000/api/search-glpi/${targetSN}`);
      const result = await res.json();
      if (result.success) setSearchResult(result.data);
      else { setSearchResult(null); alert('Equipement introuvable.'); }
    } catch (err) { alert('Erreur serveur.'); }
  };

  useEffect(() => {
    let scanner = null;
    if (isLoggedIn && isScanning && activeTab === 'search') {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((decodedText) => {
        setSearchTerm(decodedText);
        handleSearch(decodedText);
        setIsScanning(false);
        scanner.clear();
      }, (err) => {});
    }
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [isScanning, activeTab, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.brandIcon}>M</div>
          <h1 style={{fontSize:'26px', fontWeight:800, margin:'10px 0'}}>MISFAT ASSET</h1>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Utilisateur" style={styles.inputElite} onChange={(e) => setCredentials({...credentials, username: e.target.value})} />
            <input type="password" placeholder="Mot de passe" style={{...styles.inputElite, marginTop:'15px'}} onChange={(e) => setCredentials({...credentials, password: e.target.value})} />
            <button type="submit" style={styles.btnFull}>Se connecter</button>
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
          * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
          .nav-item { 
            display: flex; align-items: center; gap: 12px; padding: 14px 20px;
            color: #94a3b8; cursor: pointer; border-radius: 12px; transition: 0.3s;
            border: none; background: none; width: 100%; font-size: 15px; font-weight: 500;
          }
          .nav-item.active { color: #fff; background: #3b82f6; box-shadow: 0 10px 20px rgba(59,130,246,0.3); }
          .nav-item:hover:not(.active) { color: #fff; background: rgba(255,255,255,0.05); }
          
          /* Table Style Enhancements */
          .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .data-table th { text-align: left; padding: 16px; font-size: 12px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; background: #fcfdfe; }
          .data-table td { padding: 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }
          .status-badge { padding: 4px 10px; borderRadius: 20px; fontSize: 12px; fontWeight: 600; background: #dcfce7; color: #166534; }
        `}
      </style>

      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.miniLogo}>M</div>
          <span style={{fontWeight:800, fontSize:'20px'}}>MISFAT</span>
        </div>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:'10px', padding:'0 15px'}}>
          <button onClick={() => changeTab('generate')} className={`nav-item ${activeTab==='generate' ? 'active':''}`}><span>🏷️</span> Stickers</button>
          <button onClick={() => changeTab('search')} className={`nav-item ${activeTab==='search' ? 'active':''}`}><span>🔍</span> Inventaire</button>
        </div>
        <div style={{padding:'20px'}}><button onClick={() => setIsLoggedIn(false)} style={styles.logoutBtn}>Sortie</button></div>
      </aside>

      <main style={styles.main}>
        <div style={styles.header}>
          <h2 style={{margin:0, fontSize:'28px', fontWeight:800}}>{activeTab === 'generate' ? 'Stickers' : 'Recherche GLPI'}</h2>
        </div>

        {activeTab === 'generate' ? (
          <div style={styles.card}>
            <div style={styles.formGrid}>
              <div style={styles.group}><label style={styles.lbl}>Usager</label><input value={genData.usr} onChange={(e)=>setGenData({...genData, usr:e.target.value})} style={styles.inputElite} /></div>
              <div style={styles.group}><label style={styles.lbl}>N° Série</label><input value={genData.ns} onChange={(e)=>setGenData({...genData, ns:e.target.value})} style={styles.inputElite} /></div>
              <div style={styles.group}><label style={styles.lbl}>Modèle</label><input value={genData.model} onChange={(e)=>setGenData({...genData, model:e.target.value})} style={styles.inputElite} /></div>
              <div style={styles.group}><label style={styles.lbl}>Département</label><input value={genData.dept} onChange={(e)=>setGenData({...genData, dept:e.target.value})} style={styles.inputElite} /></div>
            </div>
            <button onClick={async () => {
              const res = await fetch('http://localhost:3000/generate-qr', {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify(genData)
              });
              const d = await res.json(); setQrCodeUrl(d.qrCodeUrl);
            }} style={styles.btnPrimary}>Générer le Code QR</button>
            
            {qrCodeUrl && (
              <div style={{marginTop:'30px', textAlign:'center'}}>
                <div style={styles.qrContainer}><img src={qrCodeUrl} alt="Preview" style={{width:'180px'}} /></div>
                <button onClick={handlePrint} style={styles.btnPrint}>🖨️ Imprimer Sticker</button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={styles.card}>
              <div style={{display:'flex', gap:'15px'}}>
                <div style={{position:'relative', flex:1}}>
                  <input placeholder="Scanner ou Saisir S/N..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSearch()} style={styles.inputElite} />
                  <button onClick={()=>setIsScanning(!isScanning)} style={styles.camBtn}>{isScanning ? '✕' : '📷'}</button>
                </div>
                <button onClick={()=>handleSearch()} style={styles.btnDark}>Chercher</button>
              </div>
              {isScanning && <div id="reader" style={styles.scannerWrapper}></div>}
            </div>

            {searchResult && (
              <div style={styles.card}>
                <h3 style={{marginTop: 0, marginBottom: '20px', color: '#1e293b'}}>Résultats de l'Inventaire</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Usager</th>
                      <th>N° Série</th>
                      <th>Modèle / Type</th>
                      <th>Lieu / Site</th>
                      <th>Statut</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{fontWeight:700}}>{searchResult.user || 'N/A'}</td>
                      <td><code style={styles.snBadge}>{searchResult.ns}</code></td>
                      <td>
                        <div style={{fontWeight:600}}>{searchResult.model}</div>
                        <div style={{fontSize:'12px', color:'#94a3b8'}}>{searchResult.type || 'Hardware'}</div>
                      </td>
                      <td>{searchResult.location || 'Misfat HQ'}</td>
                      <td><span className="status-badge">{searchResult.status || 'En Service'}</span></td>
                      <td>
                        <button 
                          onClick={()=>{
                            setGenData({
                              usr: searchResult.user, 
                              ns: searchResult.ns, 
                              model: searchResult.model, 
                              dept: searchResult.location
                            }); 
                            setActiveTab('generate'); 
                            setQrCodeUrl('');
                          }} 
                          style={styles.btnTransfer}
                        >
                          Importer
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  loginPage: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  loginCard: { backgroundColor: '#fff', padding: '50px', borderRadius: '32px', width: '400px', textAlign: 'center' },
  brandIcon: { width: '55px', height: '55px', background: '#3b82f6', borderRadius: '15px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '26px' },
  layout: { display: 'flex', height: '100vh', overflow:'hidden' },
  sidebar: { width: '280px', background: '#0f172a', display: 'flex', flexDirection: 'column', color: '#fff' },
  sidebarHeader: { padding: '40px 30px', display: 'flex', alignItems: 'center', gap: '15px' },
  miniLogo: { padding: '10px 14px', background: '#3b82f6', borderRadius: '10px', fontWeight: 900 },
  main: { flex: 1, padding: '40px 60px', overflowY: 'auto', backgroundColor: '#f8fafc' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  card: { background: '#fff', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '35px' },
  group: { display: 'flex', flexDirection: 'column', gap: '10px' },
  lbl: { fontSize: '14px', fontWeight: 700, color: '#475569' },
  inputElite: { padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '15px', width: '100%', outline: 'none' },
  btnFull: { width: '100%', padding: '16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 700, marginTop: '25px', cursor: 'pointer' },
  btnPrimary: { width: '100%', padding: '18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' },
  btnDark: { padding: '0 30px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 600, cursor: 'pointer' },
  camBtn: { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' },
  logoutBtn: { width: '100%', padding: '14px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' },
  btnTransfer: { padding: '8px 16px', background: '#3b82f6', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#fff' },
  snBadge: { background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600, color: '#475569' },
  qrContainer: { display: 'inline-block', padding: '20px', background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' },
  btnPrint: { display: 'block', margin: '20px auto', padding: '16px 45px', background: '#10b981', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 700, cursor: 'pointer' },
  scannerWrapper: { marginTop: '20px', borderRadius: '20px', overflow: 'hidden', border: '3px solid #3b82f6' }
};

export default App;