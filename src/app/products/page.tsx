'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <p className="text-gray-600">Redirecting to dashboard...</p>
    </div>
  );
}
