import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  // Les states bch ncheddu chnowa yiktib el user
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault(); // n-wa9fu el refresh mta3 el page

    // El verification elli t7eb 3liha: admin / admin
    if (email === "admin" && password === "admin") {
      setError(""); 
      navigate('/generator'); // ken s7a7 yemchi lel generator
    } else {
      setError("Email ou mot de passe incorrect !"); // ken ghalat i-talla3 erreur
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-section">
          <div className="logo-box">M</div>
          <h2>MISFAT <span>ASSET</span></h2>
        </div>
        <p>Connectez-vous pour gérer les équipements</p>

        {/* Ken famma erreur yitla3 houni b-el a7mar */}
        {error && <p style={{ 
          color: '#ff4d4d', 
          backgroundColor: '#ffe6e6', 
          padding: '10px', 
          borderRadius: '5px', 
          fontSize: '13px',
          textAlign: 'center',
          width: '100%',
          marginBottom: '15px'
        }}>{error}</p>}

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div className="input-group">
            <label>UTILISATEUR (OU EMAIL)</label>
            <input 
              type="text" 
              placeholder="admin" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>MOT DE PASSE</label>
            <input 
              type="password" 
              placeholder="admin" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            LOG IN
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;