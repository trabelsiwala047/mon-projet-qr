import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-section">
          <div className="logo-box">M</div>
          <h2>MISFAT <span>ASSET</span></h2>
        </div>
        <p>Connectez-vous pour gérer les équipements</p>
        <div className="input-group">
          <label>EMAIL</label>
          <input type="email" placeholder="admin@misfat.com.tn" />
        </div>
        <div className="input-group">
          <label>MOT DE PASSE</label>
          <input type="password" placeholder="••••••••" />
        </div>
        <button onClick={() => navigate('/generator')} className="btn-primary">LOG IN</button>
      </div>
    </div>
  );
};

export default Login;