import React, { useState } from 'react';

function CheckoutModal({ isOpen, onClose, cart, totalPrice, user, onOrderSuccess }) {
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user ? (user._id || user.id) : null,
          cart,
          total: totalPrice,
          address,
          paymentMethod
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Order placed successfully!');
        onOrderSuccess(data.order);
        onClose();
      } else {
        alert('Failed to place order: ' + data.message);
      }
    } catch (err) {
      console.error('Checkout network error:', err);
      alert('Something went wrong during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1200,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: '#1e1e1e', color: '#fff', padding: '25px',
        borderRadius: '8px', width: '400px', maxWidth: '90%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)', border: '1px solid #333'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Shipping & Checkout</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" name="fullName" placeholder="Full Name" value={address.fullName} onChange={handleChange} required style={inputStyle} />
          <input type="text" name="phone" placeholder="Phone Number" value={address.phone} onChange={handleChange} required style={inputStyle} />
          <input type="text" name="street" placeholder="Street Address" value={address.street} onChange={handleChange} required style={inputStyle} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" name="city" placeholder="City" value={address.city} onChange={handleChange} required style={{ ...inputStyle, flex: 1 }} />
            <input type="text" name="pincode" placeholder="Pincode" value={address.pincode} onChange={handleChange} required style={{ ...inputStyle, flex: 1 }} />
          </div>

          <label style={{ fontSize: '0.9rem', marginTop: '5px', color: '#a0a0a0' }}>Payment Method:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="Online">Online Payment</option>
          </select>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
            <span>Total Payable:</span>
            <span style={{ color: '#fb641b' }}>${totalPrice.toFixed(2)}</span>
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '12px', backgroundColor: '#fb641b', color: '#fff',
            border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
          }}>
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: '10px',
  backgroundColor: '#2a2a2a',
  border: '1px solid #444',
  color: '#fff',
  borderRadius: '4px',
  fontSize: '0.95rem'
};

export default CheckoutModal;