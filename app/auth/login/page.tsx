import { Suspense } from 'react';
import Login from '@/src/components/auth/Login';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}