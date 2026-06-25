import { create } from "zustand";

export interface CartItemType {
  id: string;
  artId: string;
  qty: number;
  art: {
    id: string;
    title: string;
    image: string;
    price: number;
    artist: {
      username: string;
    };
  };
}

interface CartStore {
  items: CartItemType[];
  subtotal: number;
  adminFee: number;
  serviceFee: number;
  tax: number;
  total: number;
  loading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addItem: (artId: string, qty?: number) => Promise<boolean>;
  updateQty: (cartItemId: string, qty: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => {
  const calculateTotals = (items: CartItemType[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.art.price * item.qty, 0);
    const adminFee = items.length > 0 ? 2500 : 0;
    const serviceFee = items.length > 0 ? 3000 : 0;
    const tax = Math.round(subtotal * 0.01);
    const total = subtotal + adminFee + serviceFee + tax;

    return { subtotal, adminFee, serviceFee, tax, total };
  };

  return {
    items: [],
    subtotal: 0,
    adminFee: 0,
    serviceFee: 0,
    tax: 0,
    total: 0,
    loading: false,
    error: null,

    fetchCart: async () => {
      set({ loading: true, error: null });
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) {
          throw new Error("Failed to fetch cart");
        }
        const items = await res.json();
        set({ items, ...calculateTotals(items), loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    addItem: async (artId: string, qty = 1) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artId, qty }),
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to add item to cart");
        }
        
        // Refresh cart items
        await get().fetchCart();
        return true;
      } catch (err: any) {
        set({ error: err.message, loading: false });
        return false;
      }
    },

    updateQty: async (cartItemId: string, qty: number) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId, qty }),
        });

        if (!res.ok) {
          throw new Error("Failed to update quantity");
        }

        await get().fetchCart();
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    removeItem: async (cartItemId: string) => {
      set({ loading: true, error: null });
      try {
        const res = await fetch(`/api/cart?cartItemId=${cartItemId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to remove item");
        }

        await get().fetchCart();
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    clearCart: async () => {
      set({ loading: true, error: null });
      try {
        const res = await fetch("/api/cart?clearAll=true", {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to clear cart");
        }

        set({ items: [], subtotal: 0, adminFee: 0, serviceFee: 0, tax: 0, total: 0, loading: false });
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },
  };
});
