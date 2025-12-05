import { AxiosRequestConfig } from 'axios';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface RequestConfig extends AxiosRequestConfig {}
