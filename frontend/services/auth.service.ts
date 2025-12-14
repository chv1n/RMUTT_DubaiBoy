import { apiClient } from '../lib/api/core/client';
import { z } from 'zod';

// Define the validation schema here as well for reuse, or keep it in the component/hook
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// Adjusted to match actual backend response structure AND maintain compatibility with mock
export interface LoginResponse {
  message?: string;
  data?: {
    id: number | string;
    username: string;
    email: string;
    role: string;
    fullname?: string;
  };
  // Keeping these for legacy/mock purposes if needed, but making them optional
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role?: string;
  };
}

export interface IAuthService {
  login(credentials: LoginRequest): Promise<any>;
  logout(): void;
  getToken(): string | null;
  isAuthenticated(): boolean;
}

class AuthService implements IAuthService {
  private readonly endpoint = '/auth/login';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  async login(credentials: LoginRequest): Promise<any> {
    try {
      // The API returns { message: string, data: User }
      const response = await apiClient.post<LoginResponse>(this.endpoint, credentials);

      this.setSession(response);
      return response;
    } catch (error) {
      // Fallback for demo when backend is not ready or network fails
      // Set this to false if you want to test REAL backend failure.
      // But user specifically asked for "login new" which implies real integration
      // However, providing a robust fallback is good.
      // Let's rely on the environment variable strictly or network error

      if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
        console.warn("Auth Login failed, using Mock fallback");
        const mockResponse: LoginResponse = {
          token: "mock-jwt-token-xyz",
          user: {
            id: "1",
            username: credentials.username,
            email: "admin@system.com",
            role: "SUPER_ADMIN"
          }
        };
        this.setSession(mockResponse);
        return mockResponse;
      }
      throw error;
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      // Clear cookie for mock/fallback scenarios
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

      // Try to call logout endpoint if possible, which clears the real HttpOnly cookie
      apiClient.post('/auth/logout').catch(err => console.error("Logout API failed", err));
      window.location.href = '/';
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  getUser(): any | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (!userStr || userStr === "undefined") return null;
      try {
        const user = JSON.parse(userStr);
        // Normalize role to uppercase to handle legacy data (e.g. "admin" -> "ADMIN")
        if (user && user.role) {
          user.role = user.role.toUpperCase();
        }
        return user;
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    // With cookie-based auth, we rely on the presence of user data as a proxy for 'logged in' state
    // The actual proof is the cookie which handles 401s via interceptor
    return !!this.getUser();
  }

  private setSession(response: LoginResponse) {
    if (typeof window !== 'undefined') {
      // Handle both formats:
      // 1. Backend: { data: User } (Cookies for token set by backend)
      // 2. Mock: { token: string, user: User }

      let user = response.data || response.user;
      let token = response.token; // Only available in mock or if backend changes

      if (user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }

      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
        // Set cookie for middleware to see (essential for Mock mode)
        document.cookie = `access_token=${token}; path=/; max-age=86400; SameSite=Lax`;
      } else {
        // If no token string provided, assumes HttpOnly cookie is set by backend response.
        // We clear local token to avoid confusion.
        localStorage.removeItem(this.TOKEN_KEY);
      }
    }
  }
}

export const authService = new AuthService();
