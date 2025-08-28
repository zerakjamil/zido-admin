import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({ cookies: { set: jest.fn() } })),
    redirect: jest.fn(),
  },
}))

const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>

interface MockResponse {
  cookies: {
    set: jest.Mock
  }
}

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (pathname: string, token?: string, authHeader?: string) => {
    const url = `http://localhost:3000${pathname}`
    const headers = new Map()
    if (authHeader) {
      headers.set('authorization', authHeader)
    }
    
    const cookies = new Map()
    if (token) {
      cookies.set('zido_admin_token', { value: token })
    }

    return {
      nextUrl: { pathname },
      url,
      headers: {
        get: (key: string) => headers.get(key) || null,
      },
      cookies: {
        get: (key: string) => cookies.get(key) || undefined,
      },
    } as unknown as NextRequest
  }

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users from dashboard to login', () => {
      const request = createMockRequest('/dashboard/users')
      
      middleware(request)
      
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/login'),
          searchParams: expect.objectContaining({
            get: expect.any(Function),
          }),
        })
      )
    })

    it('should allow authenticated users to access dashboard', () => {
      const request = createMockRequest('/dashboard/users', 'valid-token')
      
      const response = middleware(request)
      
      expect(mockNextResponse.redirect).not.toHaveBeenCalled()
      expect(response).toBeDefined()
    })

    it('should allow access with token in Authorization header', () => {
      const request = createMockRequest('/dashboard/users', undefined, 'Bearer valid-token')
      
      const response = middleware(request)
      
      expect(mockNextResponse.redirect).not.toHaveBeenCalled()
      expect(response).toBeDefined()
    })
  })

  describe('Authentication Routes', () => {
    it('should redirect authenticated users away from login page', () => {
      const request = createMockRequest('/login', 'valid-token')
      
      middleware(request)
      
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/dashboard'),
        })
      )
    })

    it('should allow unauthenticated users to access login page', () => {
      const request = createMockRequest('/login')
      
      const response = middleware(request)
      
      expect(mockNextResponse.redirect).not.toHaveBeenCalled()
      expect(response).toBeDefined()
    })
  })

  describe('Root Route', () => {
    it('should redirect authenticated users from root to dashboard', () => {
      const request = createMockRequest('/', 'valid-token')
      
      middleware(request)
      
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/dashboard'),
        })
      )
    })

    it('should redirect unauthenticated users from root to login', () => {
      const request = createMockRequest('/')
      
      middleware(request)
      
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('/login'),
        })
      )
    })
  })

  describe('Cookie Management', () => {
    it('should set cookie from Authorization header', () => {
      const mockResponse: MockResponse = { cookies: { set: jest.fn() } }
      mockNextResponse.next.mockReturnValue(mockResponse as unknown as NextResponse)
      
      const request = createMockRequest('/dashboard/users', undefined, 'Bearer valid-token')
      
      middleware(request)
      
      expect(mockResponse.cookies.set).toHaveBeenCalledWith(
        'zido_admin_token',
        'valid-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false, // In test environment
          sameSite: 'lax',
          maxAge: 604800, // 7 days
        })
      )
    })

    it('should not set cookie if token already exists in cookie', () => {
      const mockResponse: MockResponse = { cookies: { set: jest.fn() } }
      mockNextResponse.next.mockReturnValue(mockResponse as unknown as NextResponse)
      
      const request = createMockRequest('/dashboard/users', 'existing-token', 'Bearer new-token')
      
      middleware(request)
      
      expect(mockResponse.cookies.set).not.toHaveBeenCalled()
    })
  })
})
