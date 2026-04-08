import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(Number(id));
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return <div className="page-loading"><div className="spinner-lg" /></div>;
  if (isError || !product) return <div className="page-error"><p>Product not found.</p></div>;

  const handleAdd = () => {
    addToCart(product, qty);
    toast.success(`${qty}x ${product.title} added to cart!`);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      <div className="product-detail">
        <div className="product-detail-images">
          <img
            src={product.images?.[activeImage] || 'https://via.placeholder.com/500'}
            alt={product.title}
            className="product-detail-main-image"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500?text=No+Image'; }}
          />
          {product.images?.length > 1 && (
            <div className="product-thumbnails">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.title} ${i + 1}`}
                  className={`product-thumb ${activeImage === i ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=X'; }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <span className="product-category">{product.category?.name}</span>
          <h1 className="product-detail-title">{product.title}</h1>
          <p className="product-brand">by {product.brand}</p>
          <p className="product-detail-price">${product.price.toFixed(2)}</p>
          <p className="product-detail-desc">{product.description}</p>

          <div className="product-stock">
            <Package size={16} />
            {product.stock > 0 ? (
              <span className="in-stock">{product.stock} in stock</span>
            ) : (
              <span className="no-stock">Out of stock</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="product-actions">
              <div className="qty-control">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
              </div>
              <Button onClick={handleAdd} size="lg">
                <ShoppingCart size={18} />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;