'use client';

import React from 'react';
import { useAuth, UserRole } from '@/lib/auth/AuthContext';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback,
}) => {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-container border-t-primary" />
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      fallback ?? (
        <section className="rounded-2xl border border-error-container bg-error-container/20 p-8 text-center">
          <h1 className="text-lg font-semibold text-on-surface">Không có quyền truy cập</h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Tài khoản hiện tại không được phép truy cập trang này.
          </p>
        </section>
      )
    );
  }

  return <>{children}</>;
};
