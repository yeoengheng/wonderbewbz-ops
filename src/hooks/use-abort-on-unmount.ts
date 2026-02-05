"use client";

/**
 * Hook that returns an AbortSignal that aborts when the component unmounts
 * Useful for cancelling async operations (like retries) on unmount
 */

import { useEffect, useRef } from "react";

export function useAbortOnUnmount(): AbortSignal {
  const controllerRef = useRef<AbortController | null>(null);

  // Create controller on first access
  controllerRef.current ??= new AbortController();

  useEffect(() => {
    // Create a new controller if the previous one was aborted
    if (controllerRef.current?.signal.aborted) {
      controllerRef.current = new AbortController();
    }

    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return controllerRef.current.signal;
}
