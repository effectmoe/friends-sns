import { useState, useCallback } from 'react';
import { ApiResponse } from '@/lib/errors/custom-errors';
import { toast } from 'sonner'; // Sonnerトーストライブラリを使用（インストール必要）

interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
}

/**
 * API呼び出しのエラーハンドリングとローディング状態を管理するフック
 */
export function useApiCall<T = any>(options: UseApiCallOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<ApiResponse<T>>) => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiCall();
        
        if (response.success) {
          setData(response.data);
          
          if (options.onSuccess) {
            options.onSuccess(response.data);
          }
          
          if (options.showToast !== false && 'message' in response.data) {
            toast.success((response.data as any).message);
          }
          
          return response.data;
        } else {
          setError(response.error);
          
          if (options.onError) {
            options.onError(response.error);
          }
          
          if (options.showToast !== false) {
            toast.error(response.error.message);
          }
          
          throw response.error;
        }
      } catch (err) {
        // ネットワークエラーなど
        const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました';
        setError(errorMessage);
        
        if (options.onError) {
          options.onError(errorMessage);
        }
        
        if (options.showToast !== false) {
          toast.error(errorMessage);
        }
        
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * 複数のAPI呼び出しを順次実行するフック
 */
export function useSequentialApiCalls() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);

  const execute = useCallback(
    async (apiCalls: Array<() => Promise<ApiResponse>>) => {
      setLoading(true);
      setErrors([]);
      setResults([]);
      
      const tempResults: any[] = [];
      const tempErrors: any[] = [];
      
      for (const apiCall of apiCalls) {
        try {
          const response = await apiCall();
          
          if (response.success) {
            tempResults.push(response.data);
          } else {
            tempErrors.push(response.error);
            // エラーが発生したら処理を中断
            break;
          }
        } catch (err) {
          tempErrors.push(err);
          break;
        }
      }
      
      setResults(tempResults);
      setErrors(tempErrors);
      setLoading(false);
      
      return {
        success: tempErrors.length === 0,
        results: tempResults,
        errors: tempErrors,
      };
    },
    []
  );

  return {
    execute,
    loading,
    errors,
    results,
  };
}

/**
 * API呼び出しのリトライ機能付きフック
 */
export function useApiCallWithRetry<T = any>(
  maxRetries: number = 3,
  retryDelay: number = 1000
) {
  const apiCall = useApiCall<T>();

  const executeWithRetry = useCallback(
    async (apiCallFn: () => Promise<ApiResponse<T>>) => {
      let lastError;
      
      for (let i = 0; i <= maxRetries; i++) {
        try {
          const result = await apiCall.execute(apiCallFn);
          return result;
        } catch (error) {
          lastError = error;
          
          if (i < maxRetries) {
            // 待機してからリトライ
            await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
          }
        }
      }
      
      throw lastError;
    },
    [apiCall, maxRetries, retryDelay]
  );

  return {
    ...apiCall,
    execute: executeWithRetry,
  };
}