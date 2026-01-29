import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. Zid hatha

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => { // 2. Rodd-ha async
    e.preventDefault();
    setError(""); // Reset error list

    try {
      // 3. Kallem el Backend mte3ek (Port 3001)
      const response = await axios.post('http://localhost:3001/api/login', {
        email: email,
        password: password
      });

      if (response.data.token) {
        // 4. Khabi el Token w el Role
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);

        // 5. Direction حسب el role
        if (response.data.role === 'admin') {
          navigate('/generator'); // Walla el dashboard mta el admin
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      // 6. Ken el backend mahouch khadem walla el login ghalat
      if (!err.response) {
        setError("Erreur: Le serveur backend (3001) ne répond pas !");
      } else {
        setError(err.response.data.message || "Email ou mot de passe incorrect !");
      }
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

        {error && (
          <p style={{ 
            color: '#ff4d4d', 
            backgroundColor: '#ffe6e6', 
            padding: '10px', 
            borderRadius: '5px', 
            fontSize: '13px',
            textAlign: 'center',
            width: '100%',
            marginBottom: '15px'
          }}>{error}</p>
        )}

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <div className="input-group">
            <label>UTILISATEUR (OU EMAIL)</label>
            <input 
              type="text" 
              placeholder="votre email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>MOT DE PASSE</label>
            <input 
              type="password" 
              placeholder="••••••••" 
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