import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useCart } from '../context/CartContext';
import type { Product } from '../types/index';
import toast from 'react-hot-toast';

const HomePage: React.FC = () => {
  const { data: products, isLoading, isError } = useProducts();
  const { data: categories } = useCategories();
  const { addToCart } = useCart();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success(`${product.title} added to cart!`);
  };

  const filtered = products?.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory ? p.category?.id === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  if (isLoading) return (
    <div className="page-loading">
      <div className="spinner-lg" />
      <p>Loading products...</p>
    </div>
  );

  if (isError) return (
    <div className="page-error">
      <p>Failed to load products. Please try again.</p>
    </div>
  );

  return (
    <div className="page">
      <div className="hero">
        <h1 className="hero-title">Discover Premium Products</h1>
        <p className="hero-subtitle">Curated selection of top-quality items</p>
      </div>

      <div className="catalog-controls">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search products or brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          <Filter size={16} />
          <button
            className={`filter-btn ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {filtered?.map((product) => (
          <div key={product.id} className="product-card">
            <Link to={`/products/${product.id}`} className="product-card-image-wrap">
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/300x200'}
                alt={product.title}
                className="product-card-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
              {product.stock === 0 && <span className="out-of-stock-badge">Out of Stock</span>}
            </Link>
            <div className="product-card-body">
              <span className="product-category">{product.category?.name}</span>
              <Link to={`/products/${product.id}`}>
                <h3 className="product-title">{product.title}</h3>
              </Link>
              <p className="product-brand">{product.brand}</p>
              <div className="product-footer">
                <span className="product-price">${product.price.toFixed(2)}</span>
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart size={16} />
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered?.length === 0 && (
        <div className="empty-state">
          <p>No products found. Try a different search or filter.</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;