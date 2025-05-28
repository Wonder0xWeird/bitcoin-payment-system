export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
}

export type ApiErrorResponse = {
  success: false;
  error: string;
  retryAfter?: number;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse; 