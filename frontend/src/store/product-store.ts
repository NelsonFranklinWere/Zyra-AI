import { create } from 'zustand';

export interface Product {
  id: string;
  orgId: string;
  name: string;
  price: number;
  description: string | null;
  sku: string | null;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  loading: boolean;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  setLoading: (loading) => set({ loading }),
}));

