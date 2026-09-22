import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Standard API Response Structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  status: string;
  data?: T;
  message?: string;
  error?: unknown;
}

// Standard API Error Structure
export interface ApiError {
  success: false;
  status: string;
  message: string;
  statusCode: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Create Centralized Axios Instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Secure cookie/session handling (no localStorage tokens)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('wfa_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Network error (server offline / DNS failure)
    if (!error.response) {
      const networkError: ApiError = {
        success: false,
        status: 'NETWORK_ERROR',
        message: 'Network error: Unable to connect to WFA API server. Please check your connection.',
        statusCode: 0,
      };
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized Session Expired Placeholder
    if (status === 401) {
      console.warn('⚠️ Session expired or unauthorized. Future auth flow will redirect to Microsoft sign-in.');
    }

    const customError: ApiError = {
      success: false,
      status: (data as { status?: string })?.status || 'ERROR',
      message: (data as { message?: string })?.message || error.message || 'An unexpected API error occurred',
      statusCode: status,
    };

    return Promise.reject(customError);
  }
);

// Generic Request Helpers
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<ApiResponse<T>>(url, config).then((res) => res.data),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<ApiResponse<T>>(url, data, config).then((res) => res.data),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<ApiResponse<T>>(url, data, config).then((res) => res.data),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<ApiResponse<T>>(url, data, config).then((res) => res.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<ApiResponse<T>>(url, config).then((res) => res.data),
};

export default apiClient;
