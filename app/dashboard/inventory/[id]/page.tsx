'use client';

import { useParams } from 'next/navigation';

export default function InventoryItemPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inventory Item</h1>
      <p>Item ID: {id}</p>
      <p>This page is under construction.</p>
    </div>
  );
}