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
  };
}

export interface IAuthService {
  login(credentials: LoginRequest): Promise<LoginResponse>;
}

class AuthService implements IAuthService {
  private readonly endpoint = '/auth/login';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>(this.endpoint, credentials);
  }
}

export const authService = new AuthService();
