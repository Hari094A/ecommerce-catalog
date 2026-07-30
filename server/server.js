const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Express Middleware ---
app.use(express.json());

// Enable CORS for all origins (including Vercel frontend)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Connect to MongoDB (Cloud Atlas or Local Fallback) ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- MongoDB Product Schema ---
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  category: String,
  description: String
});

const Product = mongoose.model('Product', productSchema);

// --- MongoDB Order Schema ---
const orderSchema = new mongoose.Schema({
  userId: { type: String, default: null },
  cart: Array,
  total: Number,
  address: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    pincode: String
  },
  paymentMethod: String,
  status: { type: String, default: 'Placed' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// --- Middleware: Verify DB Connection ---
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database connection is not ready. Please check Render environment variables and MongoDB Atlas Network Access.' 
    });
  }
  next();
});

// --- Seed API: Populate Initial Sample Products ---
app.get('/api/seed', async (req, res) => {
  try {
    await Product.deleteMany({}); // Clears existing products in DB

    const sampleProducts = [
      {
        name: "Wireless Gaming Mouse",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
        category: "Electronics",
        description: "High-precision wireless gaming mouse with RGB lighting."
      },
      {
        name: "Mechanical Keyboard",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500",
        category: "Electronics",
        description: "Tactile mechanical keyboard with customizable keys."
      },
      {
        name: "Noise-Canceling Headphones",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        category: "Audio",
        description: "Premium over-ear headphones with active noise cancellation."
      },
      {
        name: "Smart Watch",
        price: 129.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category: "Wearables",
        description: "Fitness tracker with heart rate monitor and AMOLED display."
      }
    ];

    const createdProducts = await Product.insertMany(sampleProducts);
    res.json({ message: "Database seeded successfully!", count: createdProducts.length, products: createdProducts });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ message: 'Failed to seed database', error: error.message });
  }
});

// --- 0. GET API: Fetch All Products from MongoDB ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// --- 1. POST API: Save Order to MongoDB ---
app.post('/api/checkout', async (req, res) => {
  try {
    const { userId, cart, total, address, paymentMethod } = req.body;

    const newOrder = new Order({
      userId,
      cart,
      total,
      address,
      paymentMethod
    });

    await newOrder.save();
    res.status(201).json({ success: true, message: 'Order saved successfully!', order: newOrder });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Failed to save order' });
  }
});

// --- 2. GET API: Fetch User Orders from MongoDB ---
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// --- Root Homepage Route ---
app.get('/', (req, res) => {
  res.send('E-commerce Catalog API is running successfully with MongoDB!');
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));