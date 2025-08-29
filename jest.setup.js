import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock fetch
global.fetch = jest.fn()

// Prevent jsdom navigation when tests set window.location.href
try {
  // No-op instance (may be non-configurable in some jsdom versions)
  const current = window.location.href
  Object.defineProperty(window.location, 'href', {
    configurable: true,
    get: () => current,
    set: () => {
      // no-op to avoid jsdom navigation not implemented error
    },
  })
} catch {}
try {
  // Fallback: patch the prototype setter
  Object.defineProperty(window.Location.prototype, 'href', {
    configurable: true,
    set: () => {
      // no-op
    },
  })
} catch {}

// Mock Orval-generated API to route through global.fetch (which tests stub)
jest.mock('@/lib/api/generated', () => {
  return {
    adminLogin: async (credentials) => {
      const res = await fetch('/mock/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      const json = await res.json()
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || 'Login failed')
      }
      return json?.data ?? json
    },
    adminLogout: async () => {
      const res = await fetch('/mock/api/v1/logout', { method: 'POST' })
      if (!res.ok) {
        throw new Error('Logout failed')
      }
    },
    getAdminProfile: async () => {
      const res = await fetch('/mock/api/v1/admin/profile', { method: 'GET' })
      const json = await res.json()
      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || 'Profile fetch failed')
      }
      // allow either {data:{...}} or direct object
      return json?.data ?? json
    },
  }
})
