import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';

export default function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://fakestoreapi.com/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
        const uniqueCategories = ['all', ...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
        setLoading(false);
      });
  }, []);

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(item => item.category === category));
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar cartCount={cart.length} setIsCartOpen={setIsCartOpen} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex overflow-x-auto space-x-2 pb-4 mb-6">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        )}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart} 
        removeFromCart={removeFromCart} 
      />
    </div>
  );
}