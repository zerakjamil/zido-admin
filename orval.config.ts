import { defineConfig } from 'orval';

// Orval configuration to generate a fully-typed API client + React Query hooks
// Source OpenAPI file: place a copy at project root as `admin-api-openapi.json`
// or update the input path below to your actual location.
export default defineConfig({
  adminApi: {
    // Use the OpenAPI file at the project root by default
    input: 'admin-api-openapi.json',
    output: {
      target: 'src/lib/api/generated/index.ts',
      schemas: 'src/lib/api/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      prettier: true,
      clean: true,
      override: {
        // Use our custom axios mutator so we can inject baseURL, headers, and auth token
        mutator: {
          path: 'src/lib/api/client.ts',
          name: 'axiosMutator',
        },
        // Generate v5-compatible hooks (@tanstack/react-query)
        // (Orval auto-detects v5, but we can be explicit with options)
        query: {
          useSuspenseQuery: false,
          staleTime: 10_000,
        },
        // Prefer named params over big "params" object
        // so call-sites are strongly-typed per-parameter
        useNamedParameters: true,
      },
    },
  },
});
