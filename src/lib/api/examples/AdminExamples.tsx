"use client";
import React from 'react';
import { useAdminLogin, useGetAdminProfile } from '@/lib/api/generated';

export function LoginButton() {
  const login = useAdminLogin();
  return (
    <button
      className="px-3 py-2 bg-blue-600 text-white rounded"
      onClick={() => login.mutate({ data: { email: 'admin@example.com', password: 'password' } })}
    >
      Login (demo)
    </button>
  );
}

export function AdminProfile() {
  const q = useGetAdminProfile();
  if (q.isLoading) return <div>Loading…</div>;
  if (q.isError) return <div>Error</div>;
  const admin = q.data;
  if (!admin) return <div>No data</div>;
  return <div>{admin.name} ({admin.email})</div>;
}
