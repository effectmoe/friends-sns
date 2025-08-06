import { 
  handleError, 
  UnauthorizedError, 
  ValidationError, 
  DatabaseError,
  AppError,
  ApiResponse,
  successResponse,
  errorResponse 
} from '@/lib/errors/custom-errors';

/**
 * Server Action用のエラーハンドリングラッパー
 * 全てのServer Actionをこのラッパーで囲むことで、
 * 一貫したエラーハンドリングを実現
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      const result = await handler(...args);
      return successResponse(result);
    } catch (error) {
      console.error('Server Action Error:', error);
      return handleError(error);
    }
  };
}

/**
 * 認証が必要なServer Action用のラッパー
 */
export function withAuth<T extends any[], R>(
  handler: (userId: string, ...args: T) => Promise<R>,
  getUserId: () => Promise<string | null>
) {
  return withErrorHandler(async (...args: T) => {
    const userId = await getUserId();
    
    if (!userId) {
      throw new UnauthorizedError('ログインが必要です');
    }
    
    return handler(userId, ...args);
  });
}

/**
 * バリデーション付きServer Action用のラッパー
 */
export function withValidation<T extends object, R>(
  handler: (validatedData: T) => Promise<R>,
  validator: (data: unknown) => T | null
) {
  return withErrorHandler(async (data: unknown) => {
    const validatedData = validator(data);
    
    if (!validatedData) {
      throw new ValidationError('入力データが不正です');
    }
    
    return handler(validatedData);
  });
}

/**
 * レート制限付きServer Action用のラッパー
 * 実際の実装では、Redisなどを使用してIPまたはユーザーごとに制限
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  options: {
    key: string;
    limit: number;
    windowMs: number;
  }
) {
  return withErrorHandler(async (...args: T) => {
    const now = Date.now();
    const rateLimitInfo = rateLimitMap.get(options.key);
    
    if (rateLimitInfo) {
      if (now < rateLimitInfo.resetTime) {
        if (rateLimitInfo.count >= options.limit) {
          throw new AppError(
            'RATE_LIMIT_EXCEEDED',
            'リクエストが多すぎます。しばらくしてから再試行してください。',
            429
          );
        }
        rateLimitInfo.count++;
      } else {
        rateLimitMap.set(options.key, {
          count: 1,
          resetTime: now + options.windowMs,
        });
      }
    } else {
      rateLimitMap.set(options.key, {
        count: 1,
        resetTime: now + options.windowMs,
      });
    }
    
    return handler(...args);
  });
}

/**
 * トランザクション付きServer Action用のラッパー
 */
export function withTransaction<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return withErrorHandler(async (...args: T) => {
    // ここでトランザクション開始
    try {
      const result = await handler(...args);
      // トランザクションコミット
      return result;
    } catch (error) {
      // トランザクションロールバック
      throw error;
    }
  });
}

/**
 * ログ付きServer Action用のラッパー
 */
export function withLogging<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  actionName: string
) {
  return async (...args: T): Promise<ApiResponse<R>> => {
    const startTime = Date.now();
    
    try {
      console.log(`[${actionName}] Started`, { args });
      const result = await handler(...args);
      console.log(`[${actionName}] Completed`, {
        duration: Date.now() - startTime,
      });
      return successResponse(result);
    } catch (error) {
      console.error(`[${actionName}] Failed`, {
        error,
        duration: Date.now() - startTime,
      });
      return handleError(error);
    }
  };
}