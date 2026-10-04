import React from 'react';
import { AuthProvider } from '@/src/lib/auth/AuthContext';
import { RouterProvider } from '@/src/lib/router';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <RouterProvider>
        {children}
      </RouterProvider>
    </AuthProvider>
  );
}
