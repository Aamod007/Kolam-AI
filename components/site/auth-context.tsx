'use client'
import { useSession } from 'next-auth/react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Now just a passthrough since NextAuthProvider is in layout.tsx
  return <>{children}</>;
}

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ? { ...session.user } : null,
    loading: status === 'loading',
  };
}
