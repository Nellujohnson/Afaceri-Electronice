// client/src/pages/CartPage.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchCart, removeFromCart, updateCartItem, clearCart, fetchUsers } from '../api/cart.routes';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  
  const user = useSelector((state) => state.user.user);
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
    loadCart();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetchUsers();
      if (response?.success) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadCart = async (userEmail = null) => {
    try {
      setLoading(true);
      const response = await fetchCart(userEmail);
      if (response?.success) {
        setCart(response.data);
      } else {
        toast.error('Failed to load cart');
      }
    } catch (err) {
      toast.error('An error occurred while loading cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (email) => {
    setSelectedUserEmail(email);
    if (email) {
      loadCart(email);
    } else {
      loadCart();
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setProcessingId(itemId);
      const response = await updateCartItem(itemId, newQuantity);
      if (response?.success) {
        toast.success('Quantity updated');
        loadCart(selectedUserEmail || null);
      } else {
        toast.error(response?.message || 'Failed to update quantity');
      }
    } catch (err) {
      toast.error('An error occurred while updating quantity');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setProcessingId(itemId);
      const response = await removeFromCart(itemId);
      if (response?.success) {
        toast.success('Item removed from cart');
        loadCart(selectedUserEmail || null);
      } else {
        toast.error(response?.message || 'Failed to remove item');
      }
    } catch (err) {
      toast.error('An error occurred while removing item');
    } finally {
      setProcessingId(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      const response = await clearCart();
      if (response?.success) {
        toast.success('Cart cleared');
        loadCart(selectedUserEmail || null);
      } else {
        toast.error(response?.message || 'Failed to clear cart');
      }
    } catch (err) {
      toast.error('An error occurred while clearing cart');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white min-h-screen overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Shopping Cart
          </h1>
          
          {/* Admin: User selector */}
          {isAdmin && (
            <div className="flex items-center gap-3">
              <label htmlFor="userSelect" className="text-sm font-medium text-gray-700">
                View cart for:
              </label>
              <select
                id="userSelect"
                value={selectedUserEmail}
                onChange={(e) => handleUserChange(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              >
                <option value="">My Cart</option>
                {users.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Empty cart */}
        {!cart.items || cart.items.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items in cart</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start adding some products to your cart.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Browse Products
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="space-y-4 mb-8">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  {/* Product image */}
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-24 w-24 rounded object-cover"
                    />
                  )}

                  {/* Product details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.product?.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.product?.category}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Price: ${item.product?.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock: {item.product?.stock}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={processingId === item.id || item.quantity <= 1}
                        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={processingId === item.id || item.quantity >= item.product?.stock}
                        className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-lg font-bold text-gray-900">
                        ${(item.product?.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={processingId === item.id}
                        className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart summary */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Total</h2>
                <p className="text-3xl font-bold text-gray-900">
                  ${cart.total.toFixed(2)}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleClearCart}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="flex-1 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}