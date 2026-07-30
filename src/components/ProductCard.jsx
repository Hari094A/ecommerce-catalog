export default function ProductCard({ product, addToCart }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition">
      <div>
        <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4 p-4 flex items-center justify-center">
          <img src={product.image} alt={product.title} className="max-h-full object-contain" />
        </div>
        <span className="text-xs uppercase tracking-wider text-indigo-500 font-semibold">{product.category}</span>
        <h3 className="font-medium text-gray-800 text-sm line-clamp-1 mt-1">{product.title}</h3>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</span>
        <button 
          onClick={() => addToCart(product)}
          className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}