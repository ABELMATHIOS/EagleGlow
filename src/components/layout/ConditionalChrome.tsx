'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/src/components/layout/Navbar';
import Footer from '@/src/components/layout/Footer';

export default function ConditionalChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    // Admin has its own sidebar, topbar, and mobile trigger —
    // the public Navbar/Footer should never render here.
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="pt-[68px]">{children}</main>
      <Footer />
    </>
  );
}