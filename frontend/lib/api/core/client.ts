import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiError, RequestConfig } from '../types';

class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add interceptor to normalize errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message || 'An unexpected error occurred',
          status: error.response?.status || 500,
          code: (error.response?.data as any)?.code,
          errors: (error.response?.data as any)?.errors,
        };
        return Promise.reject(apiError);
      }
    );
  }

  private handleResponse<T>(response: AxiosResponse<T>): T {
    return response.data;
  }

  async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.client.request<T>({
      url: path,
      ...config,
    });
    return this.handleResponse<T>(response);
  }

  get<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  post<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'POST',
      data,
    });
  }

  put<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'PUT',
      data,
    });
  }

  patch<T>(path: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'PATCH',
      data,
    });
  }

  delete<T>(path: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }
}

// Export a singleton instance or a factory
export const apiClient = new HttpClient(
  process.env.NEXT_PUBLIC_API_URL || 'https://jsonplaceholder.typicode.com'
);
