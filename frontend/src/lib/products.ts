import apiClient from './api-client';
import { Product } from '@/store/product-store';

export interface CreateProductInput {
  name: string;
  price: number;
  description?: string;
  sku?: string;
  stock?: number;
  isActive?: boolean;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export async function getProducts(): Promise<Product[]> {
  const response = await apiClient.get<{ success: boolean; data: Product[] }>('/products');
  return response.data.data;
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  const response = await apiClient.post<{ success: boolean; data: Product }>('/products', data);
  return response.data.data;
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
  const response = await apiClient.patch<{ success: boolean; data: Product }>(`/products/${id}`, data);
  return response.data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

