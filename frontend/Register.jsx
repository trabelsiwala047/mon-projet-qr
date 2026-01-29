import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'consult' // القيمة الافتراضية
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    const response = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    alert(data.message);
  };

  return (
    <div className="register-container">
      <h2>Créer un Compte</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nom d'utilisateur" onChange={(e) => setFormData({...formData, username: e.target.value})} required />
        <input type="password" placeholder="Mot de passe" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
        <input type="password" placeholder="Confirmer mot de passe" onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
        
        <div className="role-group">
          <label>Role:</label>
          <input type="radio" name="role" value="admin" onChange={(e) => setFormData({...formData, role: e.target.value})} /> Admin
          <input type="radio" name="role" value="consult" defaultChecked onChange={(e) => setFormData({...formData, role: e.target.value})} /> Consult
        </div>

        <button type="submit">Créer</button>
      </form>
    </div>
  );
};

export default Register;