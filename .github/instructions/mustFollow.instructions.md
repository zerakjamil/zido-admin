---
applyTo: '**'
---
Next.js Application Development Guidelines
This document outlines the best practices and structure guidelines for building a scalable, professional-grade Next.js application. These guidelines ensure consistency, maintainability, and optimal performance.

1. Project Structure
Recommended Directory Layout
text

project-root/
├── app/                      # App Router (Next.js 13+)
│   ├── (auth)/              # Route groups for authentication
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected routes group
│   │   ├── layout.tsx
│   │   └── dashboard/
│   ├── api/                 # API routes
│   │   └── auth/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── Card/
│   ├── features/            # Feature-specific components
│   │   ├── auth/
│   │   └── dashboard/
│   └── layouts/             # Layout components
│       ├── Header.tsx
│       └── Footer.tsx
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   └── useDebounce.ts
├── lib/                     # Core utilities and configurations
│   ├── api/                 # API client setup
│   │   ├── client.ts
│   │   └── endpoints.ts
│   ├── auth/                # Authentication utilities
│   ├── db/                  # Database utilities (if applicable)
│   └── utils/               # General utilities
├── services/                # Business logic and API services
│   ├── auth.service.ts
│   └── user.service.ts
├── store/                   # State management
│   ├── slices/              # Redux slices or Zustand stores
│   └── providers/           # Context providers
├── types/                   # TypeScript type definitions
│   ├── api.types.ts
│   ├── auth.types.ts
│   └── index.ts
├── styles/                  # Global styles and themes
│   ├── themes/
│   └── variables.css
├── public/                  # Static assets
│   ├── images/
│   └── fonts/
├── tests/                   # Test utilities and setup
│   ├── setup.ts
│   └── utils/
├── .env.local               # Local environment variables
├── .env.example             # Example environment variables
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json
Naming Conventions
Components: PascalCase (e.g., UserProfile.tsx)
Utilities/Hooks: camelCase (e.g., useAuth.ts, formatDate.ts)
Types/Interfaces: PascalCase with descriptive suffixes (e.g., UserResponse, AuthState)
Constants: UPPER_SNAKE_CASE (e.g., API_BASE_URL)
Files: Match the default export name
Folders: kebab-case for routes, camelCase for others
App Router vs Pages Directory
Use the App Router (app/ directory) for new projects as it provides:

Server Components by default
Improved data fetching
Built-in layouts and error handling
Better performance with streaming
2. Styling Guidelines
Tailwind CSS Configuration
Primary styling approach using Tailwind CSS with the following setup:

JavaScript

// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
      },
    },
  },
  plugins: [],
}
Style Organization
Global styles: app/globals.css for base styles and Tailwind directives
Component styles: Use Tailwind utility classes directly in components
Complex animations: Create separate CSS modules when needed
Theme variables: Define in CSS custom properties for dynamic theming
3. State Management
Recommended Approach
Zustand for global state management with the following structure:

TypeScript

// store/slices/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
)
State Organization
Global state: Authentication, user preferences, app-wide settings
Server state: Use React Query/SWR for API data
Local UI state: Component useState for form inputs, modals, etc.
4. API Integration
API Client Setup
TypeScript

// lib/api/client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
Data Fetching with React Query
TypeScript

// services/user.service.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get(`/users/${userId}`).then(res => res.data),
  })
}
Type Safety
TypeScript

// types/api.types.ts
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
  }
}
5. Reusable Components
Component Structure
TypeScript

// components/ui/Button/Button.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          // variant styles
          // size styles
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? <Spinner /> : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
Component Guidelines
Always export components with named exports
Include TypeScript interfaces for props
Use forwardRef for components that need ref access
Provide default values for optional props
Create index.ts files for cleaner imports
6. Authentication & Middleware
NextAuth.js Setup
TypeScript

// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/authOptions'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
Middleware Configuration
TypeScript

// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
7. Environment & Configuration
Environment Variables
Bash

# .env.example
# Public variables (exposed to client)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://app.example.com

# Server-only variables
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
Next.js Configuration
JavaScript

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com'],
  },
  experimental: {
    serverActions: true,
  },
  redirects: async () => [
    {
      source: '/old-path',
      destination: '/new-path',
      permanent: true,
    },
  ],
}

module.exports = nextConfig
8. Deployment & Scripts
Package.json Scripts
JSON

{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "format": "prettier --write .",
    "prepare": "husky install"
  }
}
Deployment Recommendations
Vercel (Recommended for Next.js):

Zero-config deployment
Automatic preview deployments
Edge functions support
Built-in analytics
Alternative platforms:

Netlify
AWS Amplify
Railway
Self-hosted with Docker
9. AI Interaction Guidelines
Code Generation Rules
When generating code for this project:

Follow the established structure: Place new files in appropriate directories
Maintain naming conventions: Use consistent naming patterns
Type safety: Always include TypeScript types and interfaces
Import paths: Use absolute imports with @/ prefix
Component creation: Include props interface, proper exports, and basic tests
State management: Use Zustand for global state, React Query for server state
Styling: Apply Tailwind classes following the design system
Feature Implementation Process
When implementing new features:

Create types in types/ directory
Add API endpoints in services/
Create UI components in components/ui/ or components/features/
Implement business logic in custom hooks
Add necessary routes in app/ directory
Update global state if needed
Write tests for critical functionality
Consistency Guidelines
Always check existing patterns before creating new ones
Reuse existing components and utilities
Follow the established error handling patterns
Maintain consistent loading and error states
Use the configured linting and formatting rules
File Generation Template
When creating new components:

TypeScript

// components/features/[feature]/[Component].tsx
'use client' // Only if needed

import { FC } from 'react'
import { cn } from '@/lib/utils'

interface [Component]Props {
  // Define props
}

export const [Component]: FC<[Component]Props> = ({ ...props }) => {
  // Component logic
  
  return (
    <div className={cn('', props.className)}>
      {/* Component JSX */}
    </div>
  )
}
This structure ensures scalability, maintainability, and consistency across the entire application.