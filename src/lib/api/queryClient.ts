"use client";
import { QueryClient } from '@tanstack/react-query';

let client: QueryClient | null = null;

export const getQueryClient = () => {
  client ??= new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
  return client;
};
