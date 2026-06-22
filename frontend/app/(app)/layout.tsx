'use client';

import { RootLayoutClient } from '@/components/layout/RootLayoutClient';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}
