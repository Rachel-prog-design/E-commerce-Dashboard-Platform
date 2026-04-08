import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMyOrders } from '../hooks/useOrders';
import { Package, User } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'badge-yellow',
  PROCESSING: 'badge-blue',
  SHIPPED: 'badge-purple',
  DELIVERED: 'badge-green',
  CANCELLED: 'badge-red',
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { data: orders, isLoading } = useMyOrders();

  return (
    <div className="page">
      <h1 className="page-title">My Profile</h1>

      <div className="profile-layout">
        <div className="profile-card">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span className={`role-badge role-${user?.role?.toLowerCase()}`}>{user?.role}</span>
        </div>

        <div className="orders-section">
          <h2><Package size={20} /> Order History</h2>
          {isLoading && <div className="spinner" />}
          {!isLoading && (!orders || orders.length === 0) && (
            <div className="empty-state"><p>No orders yet.</p></div>
          )}
          <div className="orders-list">
            {orders?.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id">Order #{order.id}</span>
                  <span className={`badge ${statusColors[order.status] || 'badge-gray'}`}>
                    {order.status}
                  </span>
                </div>
                <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="order-total">Total: <strong>${order.totalPrice?.toFixed(2)}</strong></p>
                <p className="order-address">{order.shippingAddress}, {order.city}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;