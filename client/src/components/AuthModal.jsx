import React, { useState } from 'react';
import axios from 'axios';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Updated endpoints to match standard backend express route paths
    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLoginSuccess(response.data.user);
        onClose();
      } else {
        // Fallback handling if server succeeds without sending a token payload
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '10px' }}>
              <label>Name: </label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          )}
          <div style={{ marginBottom: '10px' }}>
            <label>Email: </label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Password: </label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '15px', cursor: 'pointer', color: 'blue' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </p>
        <button onClick={onClose} style={{ marginTop: '10px' }}>Close</button>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
};

const modalStyle = {
  background: '#fff', padding: '20px', borderRadius: '8px', minWidth: '300px'
};

export default AuthModal;