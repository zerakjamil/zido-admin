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

// Safe mock for window.location without triggering jsdom navigation
(() => {
  const originalLocation = window.location
  let hrefValue = originalLocation.href

  const locationMock = {
    ...originalLocation,
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  }

  Object.defineProperty(locationMock, 'href', {
    get: () => hrefValue,
    set: (val) => { hrefValue = String(val) },
    configurable: true,
  })

  Object.defineProperty(window, 'location', {
    value: locationMock,
    configurable: true,
  })
})()
