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