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