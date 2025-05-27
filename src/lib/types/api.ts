// API Error Information
export interface ApiError {
  isRateLimit: boolean;
  retryAfter?: number; // seconds to wait
  message?: string;
  statusCode?: number;
}

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
}

export type ApiErrorResponse = {
  success: false;
  error: string;
  apiError?: ApiError;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse; 