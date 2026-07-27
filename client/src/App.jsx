import { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import './App.css';

const CATEGORIES = ['All', 'Audio', 'Wearables', 'Peripherals'];

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  
  // Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Cart & Order State
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('shopping_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Order History State
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Product Detail Modal State
  const [viewProduct, setViewProduct] = useState(null);

  // New Review Form States inside Product Modal
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Checkout State (Item, Address, Payment)
  const [checkoutItem, setCheckoutItem] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    pincode: '',
    street: '',
    city: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Sync user name when user logs in
  useEffect(() => {
    if (user?.name) {
      setShippingAddress((prev) => ({ ...prev, fullName: user.name }));
    }
  }, [user]);

  // Fetch Products with Extended Details Fallback (including reviews array)
  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Backend offline, loading mock inventory with reviews:', err);
        setProducts([
          { 
            id: 1, 
            name: 'Wireless Headphones', 
            category: 'Audio', 
            price: 99, 
            rating: 4.8,
            reviewsCount: 128,
            stock: 12,
            description: 'High-fidelity active noise canceling headphones with deep bass response and 30-hour battery life.',
            specs: ['Active Noise Cancellation', '30hr Battery Life', 'Bluetooth 5.2', 'USB-C Fast Charging'],
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
            reviews: [
              { id: 1, userName: 'Alex Smith', rating: 5, comment: 'Absolute game changer for traveling! Battery lasts forever.' },
              { id: 2, userName: 'Sarah Jenkins', rating: 4, comment: 'Great sound quality, very comfortable on the ears.' }
            ]
          },
          { 
            id: 2, 
            name: 'Smart Watch', 
            category: 'Wearables', 
            price: 149, 
            rating: 4.6,
            reviewsCount: 94,
            stock: 7,
            description: 'Advanced fitness smartwatch with real-time heart rate monitor, sleep tracking, and OLED display.',
            specs: ['AMOLED Display', 'IP68 Water Resistant', 'SpO2 Heart Tracking', '7-Day Battery'],
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            reviews: [
              { id: 1, userName: 'David Miller', rating: 5, comment: 'Tracks workouts accurately and the display is crystal clear.' }
            ]
          },
          { 
            id: 3, 
            name: 'Gaming Mouse', 
            category: 'Peripherals', 
            price: 49, 
            rating: 4.7,
            reviewsCount: 210,
            stock: 15,
            description: 'Ergonomic esports gaming mouse with 16,000 DPI optical sensor and customizable RGB lighting.',
            specs: ['16,000 DPI Sensor', 'Customizable RGB', '6 Programmable Buttons', 'Ultra-lightweight'],
            image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500',
            reviews: []
          },
          { 
            id: 4, 
            name: 'Mechanical Keyboard', 
            category: 'Peripherals', 
            price: 89, 
            rating: 4.9,
            reviewsCount: 340,
            stock: 5,
            description: 'Tactile mechanical keyboard with hot-swappable switches, sound dampening foam, and per-key RGB.',
            specs: ['Hot-Swappable Switches', 'RGB Backlighting', 'PBT Keycaps', 'Detachable Type-C Cable'],
            image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
            reviews: []
          },
        ]);
        setLoading(false);
      });
  }, []);

  // Sync Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch User Order History
  const fetchMyOrders = async () => {
    if (!user?._id) return;
    setLoadingOrders(true);
    setIsOrdersOpen(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${user._id}`);
      const data = await res.json();
      setUserOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Trigger Toast Notification
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Add Item to Cart
  const addToCart = (product) => {
    const productId = product._id || product.id;
    setCart((prevCart) => {
      const existing = prevCart.find((item) => (item._id || item.id) === productId);
      if (existing) {
        return prevCart.map((item) =>
          (item._id || item.id) === productId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
    triggerToast(`Added "${product.name}" to cart!`);
  };

  // Remove Item / Decrement Quantity
  const removeFromCart = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => ((item._id || item.id) === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsOrdersOpen(false);
    triggerToast('Logged out successfully!');
  };

  // Open Direct Buy Modal
  const handleBuyNow = (product) => {
    setViewProduct(null);
    setCheckoutItem(product);
  };

  // Submit Product Review
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (!newReviewComment.trim()) return;

    const newReview = {
      id: Date.now(),
      userName: user.name,
      rating: Number(newReviewRating),
      comment: newReviewComment
    };

    const updatedProducts = products.map((p) => {
      if ((p._id || p.id) === (viewProduct._id || viewProduct.id)) {
        const currentReviews = p.reviews || [];
        const updatedReviews = [newReview, ...currentReviews];
        const newAvgRating = (
          updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length
        ).toFixed(1);

        const updatedProd = {
          ...p,
          reviews: updatedReviews,
          rating: Number(newAvgRating),
          reviewsCount: updatedReviews.length
        };
        setViewProduct(updatedProd);
        return updatedProd;
      }
      return p;
    });

    setProducts(updatedProducts);
    setNewReviewComment('');
    triggerToast('Review submitted successfully!');
  };

  // Submit Order with Address and Payment Details
  const handleFinalOrder = async (itemsToCheckout, totalAmount) => {
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.pincode) {
      alert('Please fill out all address fields before placing the order!');
      return;
    }

    const orderPayload = {
      userId: user?._id || null,
      cart: itemsToCheckout,
      total: totalAmount,
      address: shippingAddress,
      paymentMethod
    };

    try {
      await fetch('http://localhost:5000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
    } catch (err) {
      console.warn('Checkout API offline, placing order locally:', err);
    }

    setOrderSuccess(true);
    triggerToast('🎉 Order Placed Successfully!');
    setCheckoutItem(null);
    setIsCartOpen(false);
    setCart([]);

    setTimeout(() => {
      setOrderSuccess(false);
    }, 3000);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Filter Products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Dynamic Theme Palette
  const themeStyles = {
    backgroundColor: darkMode ? '#121212' : '#f4f6f8',
    color: darkMode ? '#ffffff' : '#111111',
    cardBg: darkMode ? '#1e1e1e' : '#ffffff',
    borderColor: darkMode ? '#333333' : '#eeeeee',
    inputBg: darkMode ? '#2d2d2d' : '#ffffff',
    subTextColor: darkMode ? '#b0b0b0' : '#666666',
    unselectedBtnBg: darkMode ? '#2d2d2d' : '#e0e0e0',
    unselectedBtnText: darkMode ? '#ffffff' : '#333333'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: themeStyles.backgroundColor, color: themeStyles.color, transition: 'all 0.3s ease', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
        
        {/* Toast Notification */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#28a745',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontWeight: 'bold',
            zIndex: 1200
          }}>
            {toastMessage}
          </div>
        )}

        {/* Header Bar */}
        <header style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 'bold', color: themeStyles.color }}>
              E-Commerce Catalog
            </h1>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: darkMode ? '#333333' : '#e0e0e0',
                  color: darkMode ? '#ffffff' : '#000000',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>

              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  padding: '10px 18px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                🛒 Cart ({totalItems})
              </button>
            </div>
          </div>

          {/* User Status Bar */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '10px', 
            padding: '12px 16px', 
            borderRadius: '10px', 
            backgroundColor: themeStyles.cardBg, 
            border: `1px solid ${themeStyles.borderColor}`,
            color: themeStyles.color
          }}>
            {user ? (
              <>
                <span style={{ fontSize: '1rem', color: themeStyles.color }}>
                  Welcome, <strong>{user.name}</strong>!
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={fetchMyOrders}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: '1px solid #17a2b8',
                      backgroundColor: 'transparent',
                      color: '#17a2b8',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    📦 My Orders
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: '1px solid #dc3545',
                      backgroundColor: 'transparent',
                      color: '#dc3545',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                👤 Login / Register
              </button>
            )}
          </div>
        </header>

        {/* Product Detail & Reviews Modal */}
        {viewProduct && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: themeStyles.cardBg,
              color: themeStyles.color,
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '550px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: `1px solid ${themeStyles.borderColor}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#007bff', backgroundColor: darkMode ? '#2d2d2d' : '#e6f0ff', padding: '4px 8px', borderRadius: '4px' }}>
                  {viewProduct.category}
                </span>
                <button onClick={() => setViewProduct(null)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: themeStyles.color, fontWeight: 'bold', fontSize: '1.2rem' }}>✕</button>
              </div>

              <img src={viewProduct.image} alt={viewProduct.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '1rem' }} />

              <h2 style={{ margin: '0 0 6px', fontSize: '1.5rem' }}>{viewProduct.name}</h2>

              {/* Rating & Stock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <span style={{ backgroundColor: '#28a745', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  ⭐ {viewProduct.rating || 4.5}
                </span>
                <span style={{ color: themeStyles.subTextColor }}>({viewProduct.reviewsCount || 0} reviews)</span>
                <span style={{ color: '#28a745', fontWeight: 'bold', marginLeft: 'auto' }}>
                  In Stock ({viewProduct.stock || 10} units)
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.95rem', color: themeStyles.subTextColor, lineHeight: '1.5', marginBottom: '1.2rem' }}>
                {viewProduct.description}
              </p>

              {/* Key Specs List */}
              {viewProduct.specs && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '1rem', color: themeStyles.color }}>Key Features:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: themeStyles.subTextColor, fontSize: '0.9rem' }}>
                    {viewProduct.specs.map((spec, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{spec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Price & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: `1px solid ${themeStyles.borderColor}`, marginBottom: '1.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: themeStyles.subTextColor, display: 'block' }}>Price</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: themeStyles.color }}>${viewProduct.price}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => addToCart(viewProduct)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={() => handleBuyNow(viewProduct)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#fb641b',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Buy Now
                  </button>
                </div>
              </div>

              {/* Customer Reviews Section */}
              <div style={{ borderTop: `1px solid ${themeStyles.borderColor}`, paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Customer Reviews</h3>
                
                {(!viewProduct.reviews || viewProduct.reviews.length === 0) ? (
                  <p style={{ color: themeStyles.subTextColor, fontSize: '0.9rem', marginBottom: '1rem' }}>No reviews yet. Be the first to review!</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {viewProduct.reviews.map((rev) => (
                      <div key={rev.id} style={{ padding: '8px 10px', backgroundColor: darkMode ? '#252525' : '#f9f9f9', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '2px' }}>
                          <span>{rev.userName}</span>
                          <span style={{ color: '#28a745' }}>⭐ {rev.rating}/5</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: themeStyles.subTextColor }}>{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Review Form */}
                <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>Leave a Review</h4>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.85rem', color: themeStyles.subTextColor }}>Rating:</label>
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: themeStyles.inputBg, color: themeStyles.color, border: `1px solid ${themeStyles.borderColor}` }}
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Write your review here..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    rows="2"
                    style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${themeStyles.borderColor}`, backgroundColor: themeStyles.inputBg, color: themeStyles.color, resize: 'none' }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '8px',
                      backgroundColor: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Submit Review
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {checkoutItem && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: themeStyles.cardBg,
              color: themeStyles.color,
              padding: '24px',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: `1px solid ${themeStyles.borderColor}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>🧾 Checkout & Billing</h2>
                <button onClick={() => setCheckoutItem(null)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: themeStyles.color, fontWeight: 'bold', fontSize: '1.2rem' }}>✕</button>
              </div>

              {/* Item Summary */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: `1px solid ${themeStyles.borderColor}` }}>
                <img src={checkoutItem.image} alt={checkoutItem.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{checkoutItem.name}</h4>
                  <p style={{ margin: 0, color: themeStyles.subTextColor, fontSize: '0.85rem' }}>Price: ${checkoutItem.price}</p>
                </div>
              </div>

              {/* Delivery Address Form */}
              <h3 style={{ fontSize: '1.05rem', margin: '0 0 10px', color: '#007bff' }}>📍 Delivery Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${themeStyles.borderColor}`, backgroundColor: themeStyles.inputBg, color: themeStyles.color }}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${themeStyles.borderColor}`, backgroundColor: themeStyles.inputBg, color: themeStyles.color }}
                />
                <input
                  type="text"
                  placeholder="House / Street / Area"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  style={{ gridColumn: 'span 2', padding: '8px', borderRadius: '6px', border: `1px solid ${themeStyles.borderColor}`, backgroundColor: themeStyles.inputBg, color: themeStyles.color }}
                />
                <input
                  type="text"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${themeStyles.borderColor}`, backgroundColor: themeStyles.inputBg, color: themeStyles.color }}
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                  style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${themeStyles.borderColor}`, backgroundColor: themeStyles.inputBg, color: themeStyles.color }}
                />
              </div>

              {/* Payment Option Selector */}
              <h3 style={{ fontSize: '1.05rem', margin: '0 0 10px', color: '#007bff' }}>💳 Payment Method</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['UPI', 'Credit/Debit Card', 'Cash on Delivery'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: paymentMethod === method ? '2px solid #fb641b' : `1px solid ${themeStyles.borderColor}`,
                      backgroundColor: paymentMethod === method ? '#fb641b' : themeStyles.inputBg,
                      color: paymentMethod === method ? '#ffffff' : themeStyles.color,
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Pricing Calculation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Item Subtotal:</span>
                  <span>${checkoutItem.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charges:</span>
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST/Taxes (5%):</span>
                  <span>${(checkoutItem.price * 0.05).toFixed(2)}</span>
                </div>
                <hr style={{ border: 'none', borderTop: `1px dashed ${themeStyles.borderColor}`, margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.15rem' }}>
                  <span>Total Amount:</span>
                  <span>${(checkoutItem.price * 1.05).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => handleFinalOrder([{ ...checkoutItem, qty: 1 }], (checkoutItem.price * 1.05).toFixed(2))}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#fb641b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ⚡ Confirm & Place Order (${(checkoutItem.price * 1.05).toFixed(2)})
              </button>
            </div>
          </div>
        )}

        {/* Order History Modal */}
        {isOrdersOpen && (
          <div style={{
            border: '2px solid #17a2b8',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '2rem',
            backgroundColor: themeStyles.cardBg,
            color: themeStyles.color
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: themeStyles.color }}>📦 My Order History</h2>
              <button onClick={() => setIsOrdersOpen(false)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: themeStyles.color, fontWeight: 'bold' }}>✕ Close</button>
            </div>

            {loadingOrders ? (
              <p style={{ color: themeStyles.subTextColor }}>Loading orders...</p>
            ) : userOrders.length === 0 ? (
              <p style={{ color: themeStyles.subTextColor }}>No past orders found.</p>
            ) : (
              userOrders.map((ord, idx) => (
                <div key={ord._id || idx} style={{ borderBottom: `1px solid ${themeStyles.borderColor}`, padding: '10px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>Order #{ord._id?.substring(0, 8)}...</span>
                    <span>Total: ${ord.total}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: themeStyles.subTextColor, marginTop: '4px' }}>
                    Items: {ord.cart?.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                  </div>
                  {ord.paymentMethod && (
                    <div style={{ fontSize: '0.8rem', color: '#17a2b8', marginTop: '2px' }}>
                      Paid via: {ord.paymentMethod}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Shopping Cart Modal */}
        {isCartOpen && (
          <div style={{
            border: '2px solid #007bff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '2rem',
            backgroundColor: themeStyles.cardBg,
            color: themeStyles.color
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: themeStyles.color }}>Your Shopping Cart</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: themeStyles.color, fontWeight: 'bold' }}>✕ Close</button>
            </div>

            {orderSuccess ? (
              <p style={{ color: '#28a745', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center', margin: '20px 0' }}>
                🎉 Order placed successfully!
              </p>
            ) : cart.length === 0 ? (
              <p style={{ color: themeStyles.subTextColor }}>Your cart is empty.</p>
            ) : (
              <div>
                {cart.map((item) => {
                  const itemId = item._id || item.id;
                  return (
                    <div key={itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${themeStyles.borderColor}` }}>
                      <span>{item.name} (x{item.qty})</span>
                      <div>
                        <span style={{ fontWeight: 'bold', marginRight: '10px' }}>${item.price * item.qty}</span>
                        <button onClick={() => removeFromCart(itemId)} style={{ cursor: 'pointer', padding: '2px 8px' }}>-</button>
                        <button onClick={() => addToCart(item)} style={{ cursor: 'pointer', padding: '2px 8px', marginLeft: '4px' }}>+</button>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: '12px', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'right' }}>
                  Total: ${totalPrice}
                </div>
                <button
                  onClick={() => setCheckoutItem({ name: 'Cart Order', price: totalPrice, category: 'Cart', image: cart[0]?.image })}
                  style={{
                    width: '100%',
                    marginTop: '15px',
                    padding: '12px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Proceed to Billing & Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '1rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: `1px solid ${themeStyles.borderColor}`,
            backgroundColor: themeStyles.inputBg,
            color: themeStyles.color,
            boxSizing: 'border-box'
          }}
        />

        {/* Category Filter Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: selectedCategory === cat ? '#007bff' : themeStyles.unselectedBtnBg,
                color: selectedCategory === cat ? '#ffffff' : themeStyles.unselectedBtnText,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid / Listings */}
        {loading ? (
          <p style={{ textAlign: 'center', color: themeStyles.subTextColor }}>Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: themeStyles.subTextColor }}>No products found matching your search or filter.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {filteredProducts.map((product) => {
              const prodId = product._id || product.id;
              return (
                <div key={prodId} style={{
                  backgroundColor: themeStyles.cardBg,
                  border: `1px solid ${themeStyles.borderColor}`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }} 
                    onClick={() => setViewProduct(product)}
                  />
                  <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.755rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#007bff', marginBottom: '4px' }}>
                      {product.category}
                    </span>
                    <h3 
                      onClick={() => setViewProduct(product)}
                      style={{ margin: '0 0 6px', fontSize: '1.05rem', cursor: 'pointer', color: themeStyles.color }}
                    >
                      {product.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginBottom: '8px', color: themeStyles.subTextColor }}>
                      <span>⭐ {product.rating || 4.5}</span>
                      <span>({product.reviewsCount || 0})</span>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: `1px solid ${themeStyles.borderColor}` }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: themeStyles.color }}>${product.price}</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => setViewProduct(product)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: 'transparent',
                            color: '#007bff',
                            border: '1px solid #007bff',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          Details
                        </button>
                        <button
                          onClick={() => addToCart(product)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                          }}
                        >
                          + Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Auth Modal Component Inclusion */}
        {isAuthOpen && (
          <AuthModal 
            isOpen={isAuthOpen} 
            onClose={() => setIsAuthOpen(false)} 
            onLoginSuccess={(userData) => {
              setUser(userData);
              localStorage.setItem('user', JSON.stringify(userData));
              setIsAuthOpen(false);
              triggerToast(`Welcome back, ${userData.name}!`);
            }}
          />
        )}

      </div>
    </div>
  );
}

export default App;