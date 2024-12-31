import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: { id: string; name: string; price: number; images?: Array<{ imageUrl: string }> }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  updateFromApi: (items: CartItem[]) => void;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(i => i.id === item.id);
        
        if (existingItem) {
          set({
            items: currentItems.map(i =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [...currentItems, {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: 1,
              image: item.images?.[0]?.imageUrl || undefined
            }],
          });
        }
      },

      removeItem: (id) => {
        set({
          items: get().items.filter(item => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map(item =>
            item.id === id
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      updateFromApi: (apiItems) => {
        set({
          items: apiItems.map(item => ({
            id: item.id,
            name: item.name,
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price),
            quantity: item.quantity,
            image: item.image
          }))
        });
      },

      get total() {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);