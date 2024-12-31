import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "./use-toast";
import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

// Generate a unique cart ID
const generateCartId = () => {
  return crypto.randomUUID();
};

// Get or create a cart ID
const getOrCreateCartId = () => {
  const storedCartId = localStorage.getItem("cartId");
  if (storedCartId) {
    return storedCartId;
  }
  const newCartId = generateCartId();
  localStorage.setItem("cartId", newCartId);
  return newCartId;
};

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export function useCart() {
  const queryClient = useQueryClient();
  const cartId = getOrCreateCartId();
  const { toast } = useToast();
  const updateStore = useCartStore((state) => state.updateFromApi);
  const clearStore = useCartStore((state) => state.clearCart);

  // Add cartId to request headers
  useEffect(() => {
    api.defaults.headers.common["X-Cart-ID"] = cartId;
  }, [cartId]);

  const { data: cart = { items: [], subtotal: 0, tax: 0, total: 0 }, isLoading } = useQuery({
    queryKey: ["cart", cartId],
    queryFn: async () => {
      const response = await api.get<Cart>(`/cart/${cartId}`);
      // Update the Zustand store with the cart data
      if (response.data?.items) {
        updateStore(response.data.items);
      }
      return response.data;
    },
  });

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      try {
        console.log('Adding to cart:', { productId, quantity, cartId });
        const response = await api.post(`/cart/${cartId}/items`, {
          productId,
          quantity,
        });
        console.log('Add to cart response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Add to cart error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", cartId] });
      toast({
        title: "Success",
        description: "Product added to cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await api.put(`/cart/${cartId}/items/${productId}`, {
        quantity,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", cartId] });
      toast({
        title: "Success",
        description: "Quantity updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/cart/${cartId}/items/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", cartId] });
      toast({
        title: "Success",
        description: "Product removed from cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove product",
        variant: "destructive",
      });
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      await api.post(`/cart/${cartId}/clear`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", cartId] });
      toast({
        title: "Success",
        description: "Cart cleared",
      });
      clearStore();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    },
  });

  return {
    cart,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    cartId,
  };
}
