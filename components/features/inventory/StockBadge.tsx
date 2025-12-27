'use client';

import type { Product } from '@/lib/types';
import { getStockStatus } from '@/lib/inventory';

interface StockBadgeProps {
  product: Product;
  className?: string;
}

export default function StockBadge({ product, className = '' }: StockBadgeProps) {
  const stockStatus = getStockStatus(product);
  
  const getColorClasses = () => {
    switch (stockStatus.color) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        getColorClasses()
      } ${className}`}
      title={`Stock: ${product.stockQuantity} units`}
    >
      {stockStatus.text}
    </span>
  );
}
