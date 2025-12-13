import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiError, RequestConfig } from '../types';

interface FailedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}

class HttpClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: FailedRequest[] = [];

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Add interceptor to normalize errors and handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
          // Check if this is arguably a retry or if we shouldn't retry specific endpoints (like login itself)
          if ((originalRequest as any)._retry || originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
            // If refresh fails or login fails, just reject
            return Promise.reject(this.normalizeError(error));
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                resolve: () => {
                  // Retry the original request
                  resolve(this.client(originalRequest));
                },
                reject: (err) => {
                  reject(err);
                }
              });
            });
          }

          (originalRequest as any)._retry = true;
          this.isRefreshing = true;

          try {
            // Attempt to refresh token
            await this.client.post('/auth/refresh');

            // On success, process queue
            this.processQueue(null);

            // Retry the original failing request
            return this.client(originalRequest);
          } catch (refreshError) {
            // On failure, process queue with error
            this.processQueue(refreshError);

            // Redirect to login if refresh fails (session expired)
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }

            return Promise.reject(this.normalizeError(refreshError as AxiosError));
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private processQueue(error: any = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(null);
      }
    });
    this.failedQueue = [];
  }

  private normalizeError(error: AxiosError): ApiError {
    return {
      message: error.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      code: (error.response?.data as any)?.code,
      errors: (error.response?.data as any)?.errors,
    };
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
  process.env.NEXT_PUBLIC_API_URL || 'https://dummyjson.com'
);
