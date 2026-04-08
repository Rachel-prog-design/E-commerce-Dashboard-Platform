import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/axios';
import type { Product, ProductFormData } from '../types/index';

export const useProducts = () =>
  useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get('/products?limit=100');
      return res.data;
    },
  });

export const useProduct = (id: number) =>
  useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ProductFormData) => {
      const payload = {
        title: data.title,
        description: data.description,
        price: data.price,
        stock: data.stock,
        brand: data.brand,
        categoryId: data.categoryId,
        images: data.images,
      };
      const res = await apiClient.post('/products', payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductFormData> }) => {
      const res = await apiClient.put(`/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/products/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
};