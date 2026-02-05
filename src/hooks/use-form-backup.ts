"use client";

/**
 * Hook for managing form data backups to localStorage
 * SSR-safe implementation
 */

import { useCallback, useEffect, useState, useRef } from "react";

import { UseFormReturn, FieldValues } from "react-hook-form";

export interface FormBackupOptions<T extends FieldValues> {
  formType: string;
  recordId: string | null;
  form: UseFormReturn<T>;
  enabled?: boolean;
}

export interface FormBackupReturn {
  hasBackup: boolean;
  backupTimestamp: Date | null;
  backupData: () => void;
  restoreBackup: () => void;
  clearBackup: () => void;
  dismissBackup: () => void;
}

const BACKUP_PREFIX = "backup-";

function getStorageKey(formType: string, recordId: string | null): string {
  return `${BACKUP_PREFIX}${formType}-${recordId ?? "new"}`;
}

interface StoredBackup<T> {
  data: T;
  timestamp: string;
}

/**
 * Hook for managing form data backups to localStorage
 * Provides backup before save, restore on dialog open, and clear on success
 */
export function useFormBackup<T extends FieldValues>({
  formType,
  recordId,
  form,
  enabled = true,
}: FormBackupOptions<T>): FormBackupReturn {
  const [hasBackup, setHasBackup] = useState(false);
  const [backupTimestamp, setBackupTimestamp] = useState<Date | null>(null);
  const dismissedRef = useRef(false);
  const storageKey = getStorageKey(formType, recordId);

  // Check for existing backup on mount (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    // Reset dismissed state when key changes (new record)
    dismissedRef.current = false;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && !dismissedRef.current) {
        const backup: StoredBackup<T> = JSON.parse(saved);
        setHasBackup(true);
        setBackupTimestamp(new Date(backup.timestamp));
      } else {
        setHasBackup(false);
        setBackupTimestamp(null);
      }
    } catch {
      setHasBackup(false);
      setBackupTimestamp(null);
    }
  }, [storageKey, enabled]);

  const backupData = useCallback(() => {
    if (typeof window === "undefined" || !enabled) return;

    const formData = form.getValues();
    const backup: StoredBackup<T> = {
      data: formData,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(backup));
    } catch (err) {
      console.error("Failed to backup form data:", err);
    }
  }, [form, storageKey, enabled]);

  const restoreBackup = useCallback(() => {
    if (typeof window === "undefined" || !enabled) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const backup: StoredBackup<T> = JSON.parse(saved);
        form.reset(backup.data);
        setHasBackup(false);
        dismissedRef.current = true;
      }
    } catch (err) {
      console.error("Failed to restore form backup:", err);
    }
  }, [form, storageKey, enabled]);

  const clearBackup = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(storageKey);
      setHasBackup(false);
      setBackupTimestamp(null);
    } catch (err) {
      console.error("Failed to clear form backup:", err);
    }
  }, [storageKey]);

  const dismissBackup = useCallback(() => {
    dismissedRef.current = true;
    setHasBackup(false);
    clearBackup();
  }, [clearBackup]);

  return {
    hasBackup,
    backupTimestamp,
    backupData,
    restoreBackup,
    clearBackup,
    dismissBackup,
  };
}
