import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LayoutDashboard, Menu, X, LogOut, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { isAuthenticated, userRole, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <Package size={24} />
          <span>ShopVault</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Catalog</Link>

          {isAuthenticated && userRole === 'ADMIN' && (
            <Link to="/admin" className="nav-link nav-link-admin" onClick={() => setMenuOpen(false)}>
              <LayoutDashboard size={16} />
              Admin Dashboard
            </Link>
          )}

          {isAuthenticated && userRole === 'USER' && (
            <>
              <Link to="/cart" className="nav-link nav-link-cart" onClick={() => setMenuOpen(false)}>
                <ShoppingCart size={16} />
                My Cart
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
              <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                <User size={16} />
                Profile
              </Link>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="nav-btn" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}

          {isAuthenticated && (
            <div className="nav-user">
              <span className="nav-username">{user?.name}</span>
              <button className="nav-logout" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;