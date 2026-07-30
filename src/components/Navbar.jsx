export default function Navbar({ cartCount, setIsCartOpen }) {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">StoreFront</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition"
        >
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}