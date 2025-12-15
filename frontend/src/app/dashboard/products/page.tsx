'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/store/product-store';
import { getProducts, createProduct, deleteProduct, type CreateProductInput } from '@/lib/products';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Package } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.coerce.number().positive('Price must be positive'),
  description: z.string().optional(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

type ProductForm = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const { products, setProducts, removeProduct, loading, setLoading } = useProductStore();
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      stock: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      setError(null);
      await createProduct(data);
      await loadProducts();
      reset();
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      removeProduct(id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-2 text-gray-600">Manage your product catalog</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Add New Product</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Product Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price *
                </label>
                <input
                  {...register('price')}
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <input
                  {...register('sku')}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                  Stock
                </label>
                <input
                  {...register('stock')}
                  type="number"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                {...register('isActive')}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Create Product</Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <div className="text-gray-500">Loading products...</div>
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500">No products yet. Add your first product above.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  {product.description && (
                    <p className="mt-2 text-sm text-gray-600">{product.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <span className="font-medium text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-gray-500">Stock: {product.stock}</span>
                    {product.sku && (
                      <span className="text-gray-500">SKU: {product.sku}</span>
                    )}
                  </div>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      product.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

