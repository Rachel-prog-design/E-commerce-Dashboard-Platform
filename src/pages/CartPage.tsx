import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="page">
      <div className="empty-cart">
        <ShoppingBag size={64} className="empty-cart-icon" />
        <h2>Your cart is empty</h2>
        <p>Add some products to get started</p>
        <Link to="/">
          <Button>Browse Products</Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="page">
      <h1 className="page-title">Shopping Cart ({totalItems} items)</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.product.id} className="cart-item">
              <img
                src={item.product.images?.[0] || 'https://via.placeholder.com/80'}
                alt={item.product.title}
                className="cart-item-image"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80'; }}
              />
              <div className="cart-item-info">
                <h3>{item.product.title}</h3>
                <p className="cart-item-brand">{item.product.brand}</p>
                <p className="cart-item-price">${item.product.price.toFixed(2)}</p>
              </div>
              <div className="cart-item-qty">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                  <Minus size={14} />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                  <Plus size={14} />
                </button>
              </div>
              <p className="cart-item-subtotal">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
              <button className="cart-remove" onClick={() => removeFromCart(item.product.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal ({totalItems} items)</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="free-shipping">Free</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <Button
            size="lg"
            className="checkout-btn"
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login', { state: { from: { pathname: '/checkout' } } });
              } else {
                navigate('/checkout');
              }
            }}
          >
            Proceed to Checkout
          </Button>
          <Link to="/" className="continue-shopping">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;