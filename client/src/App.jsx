import React, { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';

function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null);

  // Fetch products from backend on component load
 // BEFORE (Line 16)
useEffect(() => {
  fetch('https://ecommerce-catalog-2.onrender.com/api/products')
    .then((res) => res.json())
    .then((data) => setProducts(data))
    .catch((err) => console.error('Error fetching products:', err));
}, []);
  
  // Theme state configuration
  const themeStyles = {
    cardBg: '#1e1e1e',
    color: '#ffffff',
    subTextColor: '#a0a0a0',
    borderColor: '#333333',
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => (item._id || item.id) === (product._id || product.id));
      if (existing) {
        return prevCart.map((item) =>
          (item._id || item.id) === (product._id || product.id)
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) =>
          (item._id || item.id) === productId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0);
    });
  };

  return (
    <div style={{ backgroundColor: '#121212', color: themeStyles.color, minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header / Navbar */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `1px solid ${themeStyles.borderColor}`, paddingBottom: '10px' }}>
          <h1>E-Commerce Catalog</h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <button onClick={() => setIsCartOpen(true)} style={{ cursor: 'pointer', padding: '8px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}>
              🛒 Cart ({cart.reduce((sum, item) => sum + item.qty, 0)})
            </button>
            {user ? (
              <span>Hello, {user.name || 'User'}</span>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} style={{ cursor: 'pointer', padding: '8px 12px', background: '#fb641b', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Login / Register
              </button>
            )}
          </div>
        </header>

        {/* Product Catalog Grid */}
        <div style={{ marginBottom: '40px' }}>
          <h2>Available Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '15px' }}>
            {products.length === 0 ? (
              <p style={{ color: themeStyles.subTextColor }}>No products found. Add some items to your MongoDB database!</p>
            ) : (
              products.map((product) => (
                <div key={product._id} style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.borderColor}`, borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>{product.name}</h3>
                    <p style={{ color: themeStyles.subTextColor, fontSize: '0.85rem', margin: '0 0 10px' }}>{product.description}</p>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fb641b' }}>${product.price}</span>
                  </div>
                  <button 
                    onClick={() => addToCart(product)} 
                    style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fb641b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Add to Cart
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order History Section */}
        {userOrders && userOrders.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>Your Past Orders</h3>
            {userOrders.map((order) => (
              <div key={order._id} style={{ border: `1px solid ${themeStyles.borderColor}`, borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: themeStyles.subTextColor, marginBottom: '6px' }}>
                  <span>Order ID: {order._id}</span>
                  <span>Total: ${order.total}</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '0.9rem' }}>
                  {order.cart && order.cart.map((item, idx) => (
                    <li key={idx}>
                      {item.name} (x{item.qty}) - ${item.price * item.qty}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Cart Drawer / View */}
        {isCartOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '380px',
            height: '100vh',
            backgroundColor: themeStyles.cardBg,
            color: themeStyles.color,
            boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            borderLeft: `1px solid ${themeStyles.borderColor}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>🛒 Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: themeStyles.color, fontWeight: 'bold', fontSize: '1.2rem' }}>✕</button>
            </div>

            {cart.length === 0 ? (
              <p style={{ color: themeStyles.subTextColor }}>Your cart is empty.</p>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem' }}>
                  {cart.map((item) => (
                    <div key={item._id || item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${themeStyles.borderColor}`, paddingBottom: '8px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem' }}>{item.name}</h4>
                        <span style={{ fontSize: '0.85rem', color: themeStyles.subTextColor }}>${item.price} x {item.qty}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button onClick={() => removeFromCart(item._id || item.id)} style={{ padding: '2px 8px', cursor: 'pointer' }}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => addToCart(item)} style={{ padding: '2px 8px', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: `1px solid ${themeStyles.borderColor}`, paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>
                    <span>Subtotal:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    style={{ width: '100%', padding: '12px', backgroundColor: '#fb641b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Authentication Modal */}
        {isAuthOpen && (
          <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} setUser={setUser} />
        )}

        {/* Checkout Modal */}
        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
          cart={cart} 
          totalPrice={totalPrice} 
          user={user} 
          onOrderSuccess={(newOrder) => {
            setUserOrders([newOrder, ...userOrders]);
            setCart([]);
            setIsCartOpen(false);
          }} 
        />

      </div>
    </div>
  );
}

export default App;