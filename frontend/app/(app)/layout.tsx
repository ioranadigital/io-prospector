import { RootLayoutClient } from '@/components/layout/RootLayoutClient';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}
