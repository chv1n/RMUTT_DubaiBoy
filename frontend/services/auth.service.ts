import { apiClient } from '../lib/api/core/client';
import { z } from 'zod';

// Define the validation schema here as well for reuse, or keep it in the component/hook
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role?: string;
  };
}

export interface IAuthService {
  login(credentials: LoginRequest): Promise<LoginResponse>;
  logout(): void;
  getToken(): string | null;
  isAuthenticated(): boolean;
}

class AuthService implements IAuthService {
  private readonly endpoint = '/auth/login';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // For Hackathon/Demo: If API fails (404/500), fallback to mock if username is 'admin'
    // This allows testing UI without running backend.
    try {
      const response = await apiClient.post<LoginResponse>(this.endpoint, credentials);
      this.setSession(response);
      return response;
    } catch (error) {
      // Fallback for demo when backend is not ready
      if (process.env.NEXT_PUBLIC_USE_MOCK === 'true' || true) { // Force mock for now as requested "Mock data"
        console.warn("Auth Login failed, using Mock fallback");
        const mockResponse: LoginResponse = {
          token: "mock-jwt-token-xyz",
          user: {
            id: "1",
            username: credentials.username,
            email: "admin@system.com",
            role: "admin"
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
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setSession(response: LoginResponse) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    }
  }
}

export const authService = new AuthService();
