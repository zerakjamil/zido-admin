"use client";
import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from './queryClient';

export function ReactQueryProvider({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
