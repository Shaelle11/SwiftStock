'use client';

import { useRouter } from 'next/navigation';

export default function NewInventoryItemPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Inventory Item</h1>
      <p>This page is under construction.</p>
      <button 
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Go Back
      </button>
    </div>
  );
}