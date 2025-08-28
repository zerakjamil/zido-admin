"use client";
import { useQueryClient } from '@tanstack/react-query';
import { useGetAdminProfile, useAdminLogout } from './generated';

export function useAdminProfile() {
  return useGetAdminProfile({
    query: {
      staleTime: 10_000,
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const m = useAdminLogout({
    mutation: {
      onSuccess: () => {
        qc.removeQueries();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('zido_admin_token');
          localStorage.removeItem('zido_admin_user');
        }
      },
    },
  });
  return m;
}
