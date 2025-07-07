import { ApiResponse } from '../types';

export class ResponseUtil {
  static success<T>(data?: T, message = '성공'): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, errorCode?: string): ApiResponse {
    return {
      success: false,
      message,
      errorCode,
    };
  }
} 