import { api } from './api';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartResponse {
  id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  total: number;
}

export const cartService = {
  getCart: () => api.get<CartResponse>('/cart'),
  
  addToCart: (item: CartItem) => 
    api.post<CartResponse>('/cart/items', item),
  
  updateQuantity: (productId: string, quantity: number) => 
    api.put<CartResponse>(`/cart/items/${productId}`, { quantity }),
  
  removeFromCart: (productId: string) => 
    api.delete<CartResponse>(`/cart/items/${productId}`),
  
  clearCart: () => 
    api.post<CartResponse>('/cart/clear'),
};
