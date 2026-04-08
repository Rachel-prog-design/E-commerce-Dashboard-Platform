export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
}

export interface Category {
  id: number;
  name: string;
  image?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  category: Category;
  images: string[];
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type PaymentMethod = 'CREDIT_CARD' | 'PAYPAL' | 'MOBILE_MONEY' | 'CASH_ON_DELIVERY';

export interface Order {
  id: number;
  user?: User;
  items: CartItem[];
  status: OrderStatus;
  totalPrice: number;
  shippingAddress: string;
  city: string;
  postalCode?: string;
  phoneNumber: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  categoryId: number;
  images: string[];
}

export interface CheckoutFormData {
  fullName: string;
  shippingAddress: string;
  city: string;
  postalCode?: string;
  phoneNumber: string;
  email: string;
  paymentMethod: PaymentMethod;
}