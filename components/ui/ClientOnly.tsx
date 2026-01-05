'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Client-only wrapper component for components that use window/location
export default function ClientOnly({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Re-export common client-only components
export const DynamicClientWrapper = dynamic(
  () => import('./ClientOnly').then((mod) => mod.default),
  { ssr: false }
);