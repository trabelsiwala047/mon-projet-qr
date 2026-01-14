import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Generator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ usr: '', ns: '', model: '', dept: '' });

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">AssetOS</div>
        <button onClick={() => navigate('/')} className="btn-logout">Déconnexion</button>
      </nav>
      <main className="content">
        <div className="form-card">
          <h3>Générer un QR Code</h3>
          <div className="grid-inputs">
            {['usr', 'ns', 'model', 'dept'].map(f => (
              <div key={f} className="input-field">
                <label>{f.toUpperCase()}</label>
                <input onChange={(e) => setFormData({...formData, [f]: e.target.value})} />
              </div>
            ))}
          </div>
          <button className="btn-generate">Générer & Imprimer</button>
        </div>
      </main>
    </div>
  );
};

export default Generator;