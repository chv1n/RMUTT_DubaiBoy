import { useState } from 'react';
import { authService, LoginRequest, LoginResponse } from '../../services/auth.service';
import { ApiError } from '../../lib/api/types';

interface UseLoginResult {
  login: (credentials: LoginRequest) => Promise<LoginResponse | undefined>;
  isLoading: boolean;
  error: ApiError | null;
}

export function useLogin(): UseLoginResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
}
