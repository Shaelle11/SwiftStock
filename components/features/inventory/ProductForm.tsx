'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, getErrorMessage } from '@/lib/utils/api';
import type { Product, ProductFormData } from '@/lib/types';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be non-negative'),
  lowStockThreshold: z.number().int().min(0, 'Low stock threshold must be non-negative'),
  barcode: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

interface ProductFormProps {
  product?: Product;
  onSubmit?: (product: Product) => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description || '',
      category: product.category,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      barcode: product.barcode || '',
      imageUrl: product.imageUrl || '',
    } : {
      name: '',
      description: '',
      category: '',
      costPrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      lowStockThreshold: 10,
      barcode: '',
      imageUrl: '',
    }
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get<string[]>('/api/products/categories');
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };

    loadCategories();
  }, []);

  const onFormSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = product
        ? await api.put<Product>(`/api/products/${product.id}`, data as unknown as Record<string, unknown>)
        : await api.post<Product>('/api/products', data as unknown as Record<string, unknown>);

      if (response.success && response.data) {
        onSubmit?.(response.data);
        if (!onSubmit) {
          router.push('/dashboard/inventory');
        }
      } else {
        setError(response.error || 'Failed to save product');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Calculate profit margin
  const costPrice = watch('costPrice');
  const sellingPrice = watch('sellingPrice');
  const profitMargin = costPrice > 0 ? ((sellingPrice - costPrice) / costPrice * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {product ? 'Edit Product' : 'Add New Product'}
      </h2>

      {error && (
        <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-700 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <input
              {...register('category')}
              type="text"
              id="category"
              list="categories"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-700 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter or select category"
            />
            <datalist id="categories">
              {categories.map(category => (
                <option key={category} value={category} />
              ))}
            </datalist>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-700 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter product description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700">
              Cost Price (₦) *
            </label>
            <input
              {...register('costPrice', { valueAsNumber: true })}
              type="number"
              id="costPrice"
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-700 focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.costPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.costPrice.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">
              Selling Price (₦) *
            </label>
            <input
              {...register('sellingPrice', { valueAsNumber: true })}
              type="number"
              id="sellingPrice"
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-700 focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.sellingPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.sellingPrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profit Margin
            </label>
            <div className="mt-1 p-2 bg-gray-100 rounded-md">
              <span className={`text-sm font-medium ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700">
              Stock Quantity *
            </label>
            <input
              {...register('stockQuantity', { valueAsNumber: true })}
              type="number"
              id="stockQuantity"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-700 focus:border-blue-500 focus:ring-blue-500"
              placeholder="0"
            />
            {errors.stockQuantity && (
              <p className="mt-1 text-sm text-red-600">{errors.stockQuantity.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">
              Low Stock Threshold *
            </label>
            <input
              {...register('lowStockThreshold', { valueAsNumber: true })}
              type="number"
              id="lowStockThreshold"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-700 focus:border-blue-500 focus:ring-blue-500"
              placeholder="10"
            />
            {errors.lowStockThreshold && (
              <p className="mt-1 text-sm text-red-600">{errors.lowStockThreshold.message}</p>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">
              Barcode
            </label>
            <input
              {...register('barcode')}
              type="text"
              id="barcode"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-700 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter barcode"
            />
            {errors.barcode && (
              <p className="mt-1 text-sm text-red-600">{errors.barcode.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              {...register('imageUrl')}
              type="url"
              id="imageUrl"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm placeholder-gray-700 focus:border-blue-500 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
}
