import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';
import type { Order, OrderStatus, CheckoutFormData } from '../types/index';
import { useCart } from '../context/CartContext';

export const useMyOrders = () =>
  useQuery<Order[]>({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders/me');
      return res.data;
    },
  });

export const useAllOrders = () =>
  useQuery<Order[]>({
    queryKey: ['all-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/orders');
      return res.data;
    },
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  const { clearCart } = useCart();
  return useMutation({
    mutationFn: async (data: CheckoutFormData & { items: { productId: number; quantity: number }[] }) => {
      const res = await apiClient.post('/orders', data);
      return res.data;
    },
    onSuccess: () => {
      clearCart();
      qc.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) => {
      const res = await apiClient.put(`/orders/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-orders'] }),
  });
};