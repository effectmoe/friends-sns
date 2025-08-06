/**
 * カスタムエラークラス定義
 * 統一的なエラーハンドリングのために使用
 */

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_SERVER_ERROR';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: any;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: ErrorCode, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ApiErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

// 特定のエラータイプ
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super('UNAUTHORIZED', message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: any) {
    super('FORBIDDEN', message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', details?: any) {
    super('NOT_FOUND', message, 404, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation Error', details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database Error', details?: any) {
    super('DATABASE_ERROR', message, 500, details);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network Error', details?: any) {
    super('NETWORK_ERROR', message, 503, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate Limit Exceeded', details?: any) {
    super('RATE_LIMIT_EXCEEDED', message, 429, details);
  }
}

// エラーハンドリングユーティリティ
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleError(error: unknown): ApiErrorResponse {
  // AppErrorの場合
  if (isAppError(error)) {
    return error.toJSON();
  }
  
  // Neo4jエラーの場合
  if (error && typeof error === 'object' && 'code' in error) {
    const neo4jError = error as any;
    if (neo4jError.code === 'Neo.ClientError.Security.Unauthorized') {
      return new UnauthorizedError('Database authentication failed').toJSON();
    }
    if (neo4jError.code === 'Neo.ClientError.Statement.SyntaxError') {
      return new DatabaseError('Invalid database query').toJSON();
    }
    return new DatabaseError(neo4jError.message || 'Database error').toJSON();
  }
  
  // 通常のErrorの場合
  if (error instanceof Error) {
    return new AppError(
      'INTERNAL_SERVER_ERROR',
      error.message || 'An unexpected error occurred',
      500
    ).toJSON();
  }
  
  // 未知のエラー
  return new AppError(
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred',
    500
  ).toJSON();
}

// 成功レスポンスのヘルパー
export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

// エラーレスポンスのヘルパー
export function errorResponse(error: AppError | ApiErrorResponse): ApiErrorResponse {
  if (isAppError(error)) {
    return error.toJSON();
  }
  return error;
}