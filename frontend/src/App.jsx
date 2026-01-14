import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// --- 1. PAGE LOGIN (MODIFIÉE POUR ADMIN/ADMIN) ---
const LoginPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(''); // baddelna email b-user
  const [pass, setPass] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    // Verification admin / admin
    if (user === "admin" && pass === "admin") {
      navigate('/generator');
    } else {
      alert("Accès refusé! Utilise 'admin' pour le nom d'utilisateur et le mot de passe.");
    }
  };

  return (
    <div style={st.container}>
      <div style={st.card}>
        <div style={{marginBottom: '30px'}}>
          <h1 style={st.welcomeText}>Welcome Back</h1>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '8px'}}>Connectez-vous avec admin / admin</p>
        </div>
        <div style={st.inputGroup}>
          <label style={st.label}>UTILISATEUR</label>
          <input 
            type="text" // raddineha text mouch email
            placeholder="admin" 
            style={st.input} 
            onChange={e => setUser(e.target.value)} 
          />
        </div>
        <div style={st.inputGroup}>
          <label style={st.label}>PASSWORD</label>
          <input 
            type="password" 
            placeholder="admin" 
            style={st.input} 
            onChange={e => setPass(e.target.value)} 
          />
        </div>
        <button onClick={handleLogin} style={st.btn}>LOG IN</button>
      </div>
    </div>
  );
};

// --- 2. PAGE GENERATOR ---
const GeneratorPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ usr: '', ns: '', model: '', dept: '' });
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const generateQR = async () => {
    if (!formData.usr || !formData.ns || !formData.model || !formData.dept) {
        alert("PLZ aamer les champs l-kol (USR, NS, MODEL, DEPT) obligatoires !");
        return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setQrImageUrl(data.qrCodeUrl);
      setShowQR(true);
    } catch (error) {
      alert("Erreur: Thabbet elli el Backend mahloul!");
    } finally {
      setLoading(false);
    }
  };

  if (showQR) {
    return (
      <div style={st.container}>
        <div className="print-area" style={st.qrWrapper}>
          <img src={qrImageUrl} alt="QR Code" style={st.qrImage} />
        </div>
        <div className="no-print" style={st.actionGroup}>
          <button onClick={() => window.print()} style={st.btn}>IMPRIMER</button>
          <button onClick={() => setShowQR(false)} style={st.btnSecondary}>RETOUR</button>
        </div>
      </div>
    );
  }

  return (
    <div style={st.container}>
      <div style={{...st.card, width: '450px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
            <h2 style={{margin: 0, fontSize: '22px'}}>QR Generator</h2>
            <button onClick={() => navigate('/')} style={st.btnSmallLogout}>Logout</button>
        </div>
        <div style={st.gridInputs}>
          {['usr', 'ns', 'model', 'dept'].map((field) => (
            <div key={field} style={st.inputGroup}>
              <label style={st.label}>{field.toUpperCase()}</label>
              <input 
                placeholder={`Enter ${field}`} 
                style={st.input} 
                onChange={(e) => setFormData({...formData, [field]: e.target.value})} 
              />
            </div>
          ))}
        </div>
        <button onClick={generateQR} style={st.btn} disabled={loading}>
          {loading ? 'CHARGEMENT...' : 'GÉNÉRER QR CODE'}
        </button>
      </div>
    </div>
  );
};

// --- 3. EXPORT & GLOBAL CSS ---
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/generator" element={<GeneratorPage />} />
      </Routes>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
        @media print {
          .no-print { display: none !important; }
          body, html { background: white !important; margin: 0; padding: 0; }
          .print-area { display: flex !important; justify-content: center !important; align-items: center !important; height: 100vh !important; }
          img { width: 400px !important; height: 400px !important; }
        }
      `}</style>
    </>
  );
}

const st = {
  container: { height: '100vh', width: '100vw', background: '#020617', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', fontFamily: "'Inter', sans-serif" },
  card: { background: '#0f172a', padding: '40px', borderRadius: '28px', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
  welcomeText: { fontSize: '32px', fontWeight: '800', margin: '0', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  gridInputs: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '10px' },
  inputGroup: { textAlign: 'left', marginBottom: '15px' },
  label: { fontSize: '10px', fontWeight: '700', color: '#6366f1', display: 'block', marginBottom: '8px', letterSpacing: '1px' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #334155', background: '#1e293b', color: 'white', boxSizing: 'border-box', fontSize: '14px' },
  btn: { width: '100%', padding: '14px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' },
  btnSecondary: { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', width: '100%', padding: '14px', borderRadius: '10px', cursor: 'pointer', marginTop: '10px' },
  btnSmallLogout: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  qrWrapper: { background: 'white', padding: '20px', borderRadius: '15px' },
  qrImage: { width: '300px', height: '300px', display: 'block' },
  actionGroup: { marginTop: '30px', width: '300px', textAlign: 'center' }
};