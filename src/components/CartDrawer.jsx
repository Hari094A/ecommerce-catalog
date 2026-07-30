export default function CartDrawer({ isOpen, onClose, cart, removeFromCart }) {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="w-full max-w-md bg-white h-full p-6 flex flex-col shadow-xl">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black font-bold">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Your cart is empty.</p>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <img src={item.image} alt={item.title} className="w-12 h-12 object-contain" />
                  <div>
                    <h4 className="text-sm font-medium line-clamp-1">{item.title}</h4>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(index)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-base font-bold mb-4">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => alert('Checkout simulation successful!')}
            disabled={cart.length === 0}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}