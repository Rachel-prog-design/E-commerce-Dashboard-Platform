import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, RefreshCw, Tag, ShoppingBag } from 'lucide-react';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { useAllOrders, useUpdateOrderStatus } from '../../hooks/useOrders';
import { useCategories, useCreateCategory, useDeleteCategory } from '../../hooks/useCategories';
import type { OrderStatus, Order } from '../../types/index';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  PENDING: 'badge-yellow',
  PROCESSING: 'badge-blue',
  SHIPPED: 'badge-purple',
  DELIVERED: 'badge-green',
  CANCELLED: 'badge-red',
};

const AdminDashboard: React.FC = () => {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useAllOrders();
  const { data: categories } = useCategories();
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { mutateAsync: updateStatus } = useUpdateOrderStatus();
  const { mutateAsync: createCategory } = useCreateCategory();
  const { mutateAsync: deleteCategory } = useDeleteCategory();

  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories'>('products');
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [catModal, setCatModal] = useState(false);

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProduct(deleteProductId);
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeleteProductId(null);
    }
  };

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    try {
      await updateStatus({ id: order.id, status });
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) { toast.error('Category name is required'); return; }
    try {
      await createCategory({ name: newCatName, image: newCatImage || 'https://via.placeholder.com/200' });
      toast.success('Category created');
      setNewCatName('');
      setNewCatImage('');
      setCatModal(false);
    } catch {
      toast.error('Failed to create category');
    }
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-stats">
          <div className="stat-card"><span>{products?.length ?? 0}</span><label>Products</label></div>
          <div className="stat-card"><span>{orders?.length ?? 0}</span><label>Orders</label></div>
          <div className="stat-card"><span>{categories?.length ?? 0}</span><label>Categories</label></div>
        </div>
      </div>

      <div className="admin-tabs">
        {(['products', 'orders', 'categories'] as const).map((tab) => (
          <button
            key={tab}
            className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'products' && <ShoppingBag size={16} />}
            {tab === 'orders' && <RefreshCw size={16} />}
            {tab === 'categories' && <Tag size={16} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Product Inventory</h2>
            <Link to="/admin/products/new">
              <Button size="sm"><Plus size={16} /> Add Product</Button>
            </Link>
          </div>
          {productsLoading ? <div className="spinner" /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Brand</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <img src={p.images?.[0]} alt={p.title} className="table-product-image"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48'; }} />
                      </td>
                      <td className="table-product-title">{p.title}</td>
                      <td>{p.brand}</td>
                      <td><span className="badge badge-gray">{p.category?.name}</span></td>
                      <td>${p.price.toFixed(2)}</td>
                      <td>
                        <span className={p.stock === 0 ? 'badge badge-red' : 'badge badge-green'}>{p.stock}</span>
                      </td>
                      <td className="table-actions">
                        <Link to={`/admin/products/${p.id}/edit`}>
                          <button className="action-btn action-edit"><Pencil size={14} /></button>
                        </Link>
                        <button className="action-btn action-delete" onClick={() => setDeleteProductId(p.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>All Orders</h2>
          </div>
          {ordersLoading ? <div className="spinner" /> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user?.name || 'N/A'}</td>
                      <td>${order.totalPrice?.toFixed(2) || '0.00'}</td>
                      <td>{order.paymentMethod?.replace(/_/g, ' ')}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${statusColors[order.status] || 'badge-gray'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                        >
                          {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Categories</h2>
            <Button size="sm" onClick={() => setCatModal(true)}><Plus size={16} /> Add Category</Button>
          </div>
          <div className="categories-grid">
            {categories?.map((cat) => (
              <div key={cat.id} className="category-admin-card">
                <img src={cat.image} alt={cat.name}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100'; }} />
                <span>{cat.name}</span>
                <button className="action-btn action-delete" onClick={async () => {
                  try { await deleteCategory(cat.id); toast.success('Category deleted'); }
                  catch { toast.error('Failed to delete category'); }
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      <Modal isOpen={!!deleteProductId} onClose={() => setDeleteProductId(null)} title="Delete Product" size="sm">
        <p>Are you sure you want to delete this product? This action cannot be undone.</p>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setDeleteProductId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteProduct}>Delete</Button>
        </div>
      </Modal>

      {/* CREATE CATEGORY */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="New Category">
        <div className="form-field">
          <label className="form-label">Category Name</label>
          <input className="form-input" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Electronics" />
        </div>
        <div className="form-field">
          <label className="form-label">Image URL (optional)</label>
          <input className="form-input" value={newCatImage} onChange={(e) => setNewCatImage(e.target.value)} placeholder="https://..." />
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setCatModal(false)}>Cancel</Button>
          <Button onClick={handleCreateCategory}>Create</Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;