/**
 * Retry logic with exponential backoff for network operations
 */

import { toast } from "sonner";

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (attempt: number, maxRetries: number) => void;
  abortSignal?: AbortSignal;
}

export interface RetryResult<T> {
  success: boolean;
  data: T | null;
  error: unknown;
  attempts: number;
}

/**
 * Determines if an error is a network error that should be retried
 */
// eslint-disable-next-line complexity
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("timeout") ||
      message.includes("connection") ||
      message.includes("econnrefused") ||
      message.includes("enotfound") ||
      message.includes("socket") ||
      message.includes("failed to fetch")
    );
  }

  // Check for Supabase network errors
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    if (err.code === "PGRST000" || err.code === "NetworkError") {
      return true;
    }
  }

  return false;
}

/**
 * Determines if an error is a validation error that should NOT be retried
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    // PostgreSQL validation error codes
    const validationCodes = ["23505", "23503", "23502", "22P02", "22001"];
    if (err.code && validationCodes.includes(String(err.code))) {
      return true;
    }
  }
  return false;
}

/**
 * Executes an operation with exponential backoff retry logic
 */
// eslint-disable-next-line complexity
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const { maxRetries = 3, baseDelay = 1000, shouldRetry = isNetworkError, onRetry, abortSignal } = options;

  let lastError: unknown;
  let attempts = 0;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    attempts = attempt;

    // Check if aborted
    if (abortSignal?.aborted) {
      return {
        success: false,
        data: null,
        error: new Error("Operation aborted"),
        attempts,
      };
    }

    try {
      const result = await operation();
      return {
        success: true,
        data: result,
        error: null,
        attempts,
      };
    } catch (error) {
      lastError = error;

      // Don't retry validation errors
      if (isValidationError(error)) {
        return {
          success: false,
          data: null,
          error,
          attempts,
        };
      }

      // Check if we should retry this error
      if (!shouldRetry(error)) {
        return {
          success: false,
          data: null,
          error,
          attempts,
        };
      }

      // If not the last attempt, wait and retry
      if (attempt <= maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // 1s, 2s, 4s

        onRetry?.(attempt, maxRetries);

        // Wait with abort support
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(resolve, delay);

          if (abortSignal) {
            const abortHandler = () => {
              clearTimeout(timeoutId);
              reject(new Error("Operation aborted"));
            };
            abortSignal.addEventListener("abort", abortHandler, { once: true });
          }
        }).catch(() => {
          // Swallow abort errors, they'll be caught in the next iteration
        });
      }
    }
  }

  return {
    success: false,
    data: null,
    error: lastError,
    attempts,
  };
}

/**
 * Higher-level wrapper that shows toast notifications during retries
 */
export async function retryWithToast<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: Omit<RetryOptions, "onRetry"> = {},
): Promise<RetryResult<T>> {
  let toastId: string | number | undefined;

  const result = await retryOperation(operation, {
    ...options,
    onRetry: (attempt, maxRetries) => {
      toastId = toast.loading(`${operationName}... Retrying (attempt ${attempt + 1}/${maxRetries + 1})`, {
        id: toastId,
      });
    },
  });

  // Dismiss the loading toast if it exists
  if (toastId !== undefined) {
    toast.dismiss(toastId);
  }

  return result;
}
