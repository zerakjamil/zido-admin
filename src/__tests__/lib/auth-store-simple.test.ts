import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/lib/auth-store'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // Reset Zustand store state
    useAuthStore.setState({
      admin: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
    })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore())
      
      expect(result.current.admin).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('Login Flow', () => {
    const mockToken = 'mock-jwt-token'
    const loginCredentials = {
      email: 'admin@test.com',
      password: 'password123',
    }

    it('should handle successful login', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            admin: {
              id: 1,
              name: 'Test Admin',
              email: 'admin@test.com',
              role: 'admin',
              permissions: ['read', 'write'],
              created_at: '2024-01-01',
              updated_at: '2024-01-01',
            },
            token: mockToken,
          },
          message: 'Login successful',
        }),
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login(loginCredentials)
      })

      expect(result.current.token).toBe(mockToken)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('zido_admin_token', mockToken)
    })

    it('should handle login failure', async () => {
      const errorMessage = 'Invalid credentials'
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          message: errorMessage,
        }),
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.login(loginCredentials)
      })

      expect(result.current.admin).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('Logout Flow', () => {
    it('should handle logout', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        admin: {
          id: 1,
          name: 'Test Admin',
          email: 'admin@test.com',
          role: 'admin',
          permissions: ['read', 'write'],
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        token: 'mock-token',
        isAuthenticated: true,
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Logout successful',
        }),
      })

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.admin).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('zido_admin_token')
    })
  })

  describe('Error Handling', () => {
    it('should clear error when clearError is called', () => {
      useAuthStore.setState({ error: 'Some error message' })

      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })
})
