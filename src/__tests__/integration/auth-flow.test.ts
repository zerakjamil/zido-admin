import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/lib/auth-store'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock window.location (already mocked in jest.setup.js, just override href)
beforeEach(() => {
  window.location.href = 'http://localhost:3000/login'
})

describe('Authentication Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // Reset store state
    useAuthStore.setState({
      admin: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
    })
  })

  describe('Complete Authentication Flow', () => {
    it('should handle complete login and logout flow', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Initial state should be unauthenticated
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.admin).toBeNull()
      expect(result.current.token).toBeNull()

      // Mock successful login response
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
              permissions: ['read', 'write', 'delete'],
              created_at: '2024-01-01',
              updated_at: '2024-01-01',
            },
            token: 'mock-jwt-token',
          },
          message: 'Login successful',
        }),
      })

      // Perform login
      await act(async () => {
        await result.current.login({
          email: 'admin@test.com',
          password: 'password123',
        })
      })

      // Should be authenticated after login
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.admin).not.toBeNull()
      expect(result.current.admin?.email).toBe('admin@test.com')
      expect(result.current.token).toBe('mock-jwt-token')
      expect(result.current.error).toBeNull()
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'zido_admin_token',
        'mock-jwt-token'
      )

      // Mock successful logout response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Logout successful',
        }),
      })

      // Perform logout
      await act(async () => {
        await result.current.logout()
      })

      // Should be unauthenticated after logout
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.admin).toBeNull()
      expect(result.current.token).toBeNull()
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('zido_admin_token')
    })

    it('should handle token persistence and restoration', () => {
      // Mock token in localStorage
      mockLocalStorage.getItem.mockReturnValue('existing-token')

      // Create new store instance (simulates app reload)
      renderHook(() => useAuthStore())

      // Should restore authentication state from localStorage
      // Note: This test would require the store to initialize from localStorage
      // The actual implementation would need to check localStorage on store creation
    })

    it('should handle API errors gracefully', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await result.current.login({
          email: 'admin@test.com',
          password: 'password123',
        })
      })

      // Should handle error gracefully
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe('An unexpected error occurred. Please try again.')
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle invalid credentials', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Mock 401 response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          message: 'Invalid email or password',
        }),
      })

      await act(async () => {
        await result.current.login({
          email: 'admin@test.com',
          password: 'wrongpassword',
        })
      })

      // Should handle invalid credentials
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe('Invalid email or password')
      expect(result.current.admin).toBeNull()
      expect(result.current.token).toBeNull()
    })

    it('should clear error state', () => {
      const { result } = renderHook(() => useAuthStore())

      // Set error state
      act(() => {
        useAuthStore.setState({ error: 'Some error message' })
      })

      expect(result.current.error).toBe('Some error message')

      // Clear error
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Error Boundary Scenarios', () => {
    it('should handle malformed API responses', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Mock malformed response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          // Missing expected fields
          success: true,
        }),
      })

      await act(async () => {
        await result.current.login({
          email: 'admin@test.com',
          password: 'password123',
        })
      })

      // Should handle gracefully
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeTruthy()
    })

    it('should handle logout when already logged out', async () => {
      const { result } = renderHook(() => useAuthStore())

      // Mock logout response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Already logged out',
        }),
      })

      // Try to logout when not authenticated
      await act(async () => {
        await result.current.logout()
      })

      // Should handle gracefully
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.admin).toBeNull()
      expect(result.current.token).toBeNull()
    })
  })
})
