/**
 * Standardized error handling utilities
 */

/**
 * Standard error types for the application
 */
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Formats database errors for user display
 */
export function formatDatabaseError(error: unknown): AppError {
  if (error && typeof error === "object" && "message" in error) {
    const dbError = error as { message: string; code?: string; details?: string };

    // Common Postgres error codes and user-friendly messages
    const errorMessages: Record<string, string> = {
      "23505": "This record already exists. Please check for duplicates.",
      "23503": "Cannot delete this record because it's being used elsewhere.",
      "23502": "Required information is missing. Please fill in all required fields.",
      "42P01": "Database table not found. Please contact support.",
      "42703": "Database column not found. Please contact support.",
    };

    const userMessage =
      dbError.code && errorMessages[dbError.code]
        ? errorMessages[dbError.code]
        : "An error occurred while saving your data. Please try again.";

    return {
      message: userMessage,
      code: dbError.code,
      details: dbError.details ?? dbError.message,
    };
  }

  return {
    message: "An unexpected error occurred. Please try again.",
    details: String(error),
  };
}

/**
 * Handles async operations with consistent error handling
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  errorMessage = "Operation failed",
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return {
      success: false,
      error: formatDatabaseError(error),
    };
  }
}

/**
 * Standard error logging function
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, unknown>) {
  console.error(`[${context}]`, {
    error:
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error,
    ...additionalInfo,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Validates required fields and returns standardized error
 */
export function validateRequiredFields(data: Record<string, unknown>, requiredFields: string[]): AppError | null {
  const missingFields = requiredFields.filter(
    (field) => !data[field] || (typeof data[field] === "string" && !data[field].trim()),
  );

  if (missingFields.length > 0) {
    return {
      message: `Please fill in the following required fields: ${missingFields.join(", ")}`,
      code: "VALIDATION_ERROR",
      details: { missingFields },
    };
  }

  return null;
}

/**
 * Creates a consistent loading state handler
 */
export function createLoadingHandler() {
  let isLoading = false;

  return {
    async execute<T>(operation: () => Promise<T>): Promise<T> {
      if (isLoading) {
        throw new Error("Operation already in progress");
      }

      isLoading = true;
      try {
        return await operation();
      } finally {
        isLoading = false;
      }
    },
    get loading() {
      return isLoading;
    },
  };
}
