import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

// --- EL BADDILA EL MOHIMMA: El lien mta' Render ---
const API_URL = "https://mon-projet-qr.onrender.com";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('search');

  const [isRegistering, setIsRegistering] = useState(false);
  const [regData, setRegData] = useState({ username: '', password: '', role: 'consult' });
  
  const [stickerData, setStickerData] = useState({ ns: '', model: '', user: '', dept: '' });
  const [qrVisible, setQrVisible] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [editData, setEditData] = useState({ statut: '', it_comment: '' }); 

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, {
        email: credentials.username,
        password: credentials.password
      });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        setIsLoggedIn(true);

        if (res.data.role === 'admin') {
          alert("🔓 Accès Admin: Vous avez l'accès.");
        } else {
          alert("👁️ Mode Consult: Accès limité.");
        }
      }
    } catch (err) { alert("Login Error: vérifier vos données!"); }
  };

  // --- REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/register`, regData);
      if (res.data.success) {
        alert("Compte créé avec succès ! Tawa tnajem taamel login.");
        setIsRegistering(false);
      }
    } catch (err) { alert("Erreur: Username momken dejà mawjoud."); }
  };

  // --- SEARCH ---
  const handleSearch = async (sn) => {
    const targetSN = sn || searchTerm;
    if (!targetSN) return;
    try {
      const res = await axios.get(`${API_URL}/api/asset/${targetSN.trim()}`);
      setSearchResult(res.data);
      setIsScanning(false);
      setIsEditing(false); 
    } catch (err) { alert('Asset non trouvé'); }
  };

  // --- UPDATE ---
  const handleUpdate = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/asset/update`, {
        sn: searchResult.Serial_Number,
        statut: editData.statut,
        it_comment: editData.it_comment
      });
      if (res.data.success) {
        alert("Modifications enregistrées avec succès !");
        setSearchResult({ ...searchResult, State: editData.statut, comment: editData.it_comment });
        setIsEditing(false);
      }
    } catch (err) { alert("Erreur lors de la mise à jour"); }
  };

  // --- SCANNER LOGIC ---
  useEffect(() => {
    let scanner = null;
    if (isLoggedIn && isScanning && activeTab === 'search') {
      scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((text) => {
        setSearchTerm(text);
        handleSearch(text);
        scanner.clear();
        setIsScanning(false);
      }, (err) => {});
    }
    return () => { if (scanner) scanner.clear().catch(() => {}); };
  }, [isScanning, activeTab, isLoggedIn]);

  const handlePrint = () => { window.print(); };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h2 style={{color:'#fff', marginBottom:'30px'}}>
            {isRegistering ? 'CRÉER UN COMPTE' : 'MISFAT SECURE'}
          </h2>
          
          {isRegistering ? (
            <form onSubmit={handleRegister}>
              <input type="text" placeholder="Username" style={styles.loginInput} 
                onChange={(e)=>setRegData({...regData, username:e.target.value})} required />
              <input type="password" placeholder="Password" style={{...styles.loginInput, marginTop:'15px'}} 
                onChange={(e)=>setRegData({...regData, password:e.target.value})} required />
              
              <select style={{...styles.loginInput, marginTop:'15px'}} 
                onChange={(e)=>setRegData({...regData, role:e.target.value})}>
                <option value="consult">Consult (Lecture seule)</option>
                <option value="admin">Admin (Full access)</option>
              </select>

              <button type="submit" style={styles.btnAuth}>CRÉER</button>
              <p onClick={() => setIsRegistering(false)} style={styles.toggleLink}>Retour</p>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Username" style={styles.loginInput} 
                onChange={(e)=>setCredentials({...credentials, username:e.target.value})} required />
              <input type="password" placeholder="Password" style={{...styles.loginInput, marginTop:'15px'}} 
                onChange={(e)=>setCredentials({...credentials, password:e.target.value})} required />
              <button type="submit" style={styles.btnAuth}>LOGIN</button>
              <p onClick={() => setIsRegistering(true)} style={styles.toggleLink}> Créer un compte</p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <aside style={styles.sideMenu} className="no-print">
        <div style={styles.sideBrand}>MISFAT IT</div>
        <nav style={{padding:'20px', display:'flex', flexDirection:'column', gap:'10px'}}>
          <button onClick={()=>setActiveTab('search')} style={activeTab === 'search' ? styles.navPillActive : styles.navPill}>🔍 Smart Search</button>
          <button onClick={()=>setActiveTab('generate')} style={activeTab === 'generate' ? styles.navPillActive : styles.navPill}>🏷️ Stickers Hub</button>
          <button onClick={()=>{localStorage.clear(); setIsLoggedIn(false)}} style={styles.btnLogOut}>Logout</button>
        </nav>
      </aside>

      <main style={styles.content}>
        {activeTab === 'search' ? (
          <div className="no-print">
             <div style={styles.bentoCard}>
              <h2 style={styles.cardTitle}>🔍 Smart Search & Scan</h2>
              <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                <input style={styles.inputBento} placeholder="Serial Number..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
                <button onClick={()=>handleSearch()} style={styles.btnPrimary}>TROUVER</button>
                <button onClick={()=>setIsScanning(!isScanning)} style={{...styles.btnPrimary, background: isScanning ? '#ef4444' : '#64748b'}}>
                  {isScanning ? 'STOP SCAN' : '📷 SCAN QR'}
                </button>
              </div>
              {isScanning && <div id="reader" style={{marginTop:'20px', borderRadius:'15px', overflow:'hidden'}}></div>}
            </div>

            {searchResult && (
               <div style={styles.bentoCard}>
                  <h3 style={styles.cardTitle}>Résultat de recherche</h3>
                  <table style={styles.dataTable}>
                    <thead>
                        <tr style={styles.tableHeader}>
                          <th>Device</th>
                          <th>S/N</th>
                          <th>Type</th>
                          <th>État</th>
                          <th>Commentaire</th>
                          <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                      <tr style={styles.tableRow}>
                        <td>{searchResult.Device_Name}</td>
                        <td>{searchResult.Serial_Number}</td>
                        <td>{searchResult.Type}</td>
                        <td>
                          {isEditing ? (
                            <select 
                              style={styles.selectSmall} 
                              value={editData.statut} 
                              onChange={(e)=>setEditData({...editData, statut: e.target.value})}
                            >
                              <option value="En stock">En stock</option>
                              <option value="En panne">En panne</option>
                              <option value="Maintenance">Maintenance</option>
                              <option value="Utilisé">Utilisé</option>
                            </select>
                          ) : (
                            <span style={styles.badge}>{searchResult.State}</span>
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <input 
                              style={styles.inputSmall} 
                              value={editData.it_comment} 
                              onChange={(e)=>setEditData({...editData, it_comment: e.target.value})} 
                            />
                          ) : (
                            searchResult.comment || "---"
                          )}
                        </td>
                        <td>
                          {localStorage.getItem('role') === 'admin' ? (
                            isEditing ? (
                              <button onClick={handleUpdate} style={styles.btnSave}>Enregistrer</button>
                            ) : (
                              <button onClick={() => {
                                setIsEditing(true);
                                setEditData({ statut: searchResult.State, it_comment: searchResult.comment || '' });
                              }} style={styles.btnEdit}>Modifier</button>
                            )
                          ) : (
                            <span style={{fontSize:'12px', color:'#94a3b8', fontWeight:'bold'}}>🚫 No Access</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
               </div>
            )}
          </div>
        ) : (
          /* --- SECTION STICKERS HUB --- */
          <div style={styles.bentoCard}>
            <div className="no-print">
              <h2 style={styles.cardTitle}>🏷️ Générateur de Stickers</h2>
              
              {localStorage.getItem('role') === 'consult' && (
                <div style={{background:'#fee2e2', color:'#b91c1c', padding:'10px', borderRadius:'8px', marginBottom:'20px', fontSize:'14px'}}>
                  ⚠️ Accès limité: Vous n'avez pas l'autorisation de remplir ce formulaire.
                </div>
              )}

              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>S/N</label>
                  <input 
                    style={styles.inputBento} 
                    value={stickerData.ns} 
                    disabled={localStorage.getItem('role') === 'consult'} 
                    onChange={(e)=>setStickerData({...stickerData, ns:e.target.value})} 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Modèle</label>
                  <input 
                    style={styles.inputBento} 
                    value={stickerData.model} 
                    disabled={localStorage.getItem('role') === 'consult'} 
                    onChange={(e)=>setStickerData({...stickerData, model:e.target.value})} 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Utilisateur</label>
                  <input 
                    style={styles.inputBento} 
                    value={stickerData.user} 
                    disabled={localStorage.getItem('role') === 'consult'} 
                    onChange={(e)=>setStickerData({...stickerData, user:e.target.value})} 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Département</label>
                  <input 
                    style={styles.inputBento} 
                    value={stickerData.dept} 
                    disabled={localStorage.getItem('role') === 'consult'} 
                    onChange={(e)=>setStickerData({...stickerData, dept:e.target.value})} 
                  />
                </div>
              </div>
              <div style={{display:'flex', gap:'15px', marginTop:'30px'}}>
                {localStorage.getItem('role') === 'admin' && (
                  <button onClick={()=>setQrVisible(true)} style={styles.btnPrimary}>GÉNÉRER QR CODE</button>
                )}
                {qrVisible && <button onClick={handlePrint} style={styles.btnSuccess}>🖨️ IMPRIMER</button>}
              </div>
            </div>

            {qrVisible && (
              <div id="qr-to-print" style={styles.stickerPrintArea}>
                <div style={styles.stickerBox}>
                   <div style={styles.stickerText}>
                      <p><strong>S/N:</strong> {stickerData.ns}</p>
                      <p><strong>MOD:</strong> {stickerData.model}</p>
                      <p><strong>DEPT:</strong> {stickerData.dept}</p>
                   </div>
                   <QRCodeCanvas value={stickerData.ns} size={100} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          #qr-to-print { display: flex !important; justify-content: center; padding: 20px; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', background:'#f0f2f5', fontFamily:'"Inter", sans-serif' },
  sideMenu: { width: '280px', background: '#1a1c23', color: '#fff' },
  sideBrand: { padding: '40px 30px', fontSize: '26px', fontWeight: '800', color:'#3b82f6' },
  content: { flex: 1, padding: '40px', overflowY: 'auto' },
  navPill: { width:'100%', padding:'14px 20px', background:'transparent', border:'none', color:'#9ca3af', textAlign:'left', cursor:'pointer', borderRadius:'12px' },
  navPillActive: { width:'100%', padding:'14px 20px', background:'#3b82f6', border:'none', color:'#fff', textAlign:'left', cursor:'pointer', borderRadius:'12px' },
  btnLogOut: { marginTop:'30px', width:'100%', padding:'12px', background:'transparent', border:'1px solid #ef4444', color:'#ef4444', borderRadius:'10px', cursor:'pointer' },
  bentoCard: { background: '#fff', borderRadius: '20px', padding: '35px', marginBottom:'30px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' },
  cardTitle: { marginBottom:'25px', fontSize:'20px', color:'#1f2937', fontWeight:'700' },
  formGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' },
  inputGroup: { display:'flex', flexDirection:'column', gap:'8px' },
  label: { fontSize:'13px', color:'#6b7280', fontWeight:'600' },
  inputBento: { padding: '12px', borderRadius: '10px', border: '1px solid #e5e7eb', background:'#f9fafb' },
  btnPrimary: { padding: '12px 25px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight:'600' },
  btnSuccess: { padding: '12px 25px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer' },
  dataTable: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
  tableHeader: { textAlign: 'left', color: '#6b7280', fontSize: '14px' },
  tableRow: { background: '#fcfcfc' },
  badge: { padding:'4px 10px', background:'#dcfce7', color:'#166534', borderRadius:'15px', fontSize:'12px', fontWeight:'700' },
  selectSmall: { padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' },
  inputSmall: { padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' },
  btnEdit: { padding: '8px 15px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  btnSave: { padding: '8px 15px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  loginPage: { height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#111827' },
  loginCard: { background:'#1f2937', padding:'50px', borderRadius:'30px', width:'400px' },
  loginInput: { width:'100%', padding:'16px', borderRadius:'12px', border:'1px solid #374151', background:'#374151', color:'#fff' },
  btnAuth: { width:'100%', padding:'16px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:'12px', marginTop:'30px', fontWeight:'700' },
  toggleLink: { color: '#3b82f6', marginTop: '20px', textAlign: 'center', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' },
  stickerPrintArea: { marginTop: '30px', display: 'flex', justifyContent: 'center' },
  stickerBox: { border: '2px solid #000', padding: '15px', display: 'flex', alignItems: 'center', gap: '20px', background: '#fff' },
  stickerText: { display: 'flex', flexDirection: 'column', fontSize: '13px', textAlign: 'left' }
};

export default App;
