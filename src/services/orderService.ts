import { api } from './api';

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
}

export interface CreateOrderRequest {
  cartItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'card' | 'à la livraison';
}

export interface Order {
  id: string;
  status: 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface TrackingInfo {
  id: string;
  status: string;
  trackingNumber: string;
  updatedAt: string;
}

export const orderService = {
  createOrder: (order: CreateOrderRequest) => {
    console.log('orderService createOrder called with:', JSON.stringify(order, null, 2));
    return api.post<Order>('/orders', order);
  },

  getOrders: (params?: { page?: number; pageSize?: number; status?: string }) => 
    api.get<OrdersResponse>('/orders', { params }),

  getOrder: (id: string) => 
    api.get<Order>(`/orders/${id}`),

  cancelOrder: (id: string) => 
    api.put<{ message: string }>(`/orders/${id}/cancel`),

  getOrderTracking: (id: string) => 
    api.get<TrackingInfo>(`/orders/${id}/tracking`),
};
