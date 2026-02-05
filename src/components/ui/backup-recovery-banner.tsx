"use client";

/**
 * Banner component for displaying backup recovery options
 */

import { AlertCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BackupRecoveryBannerProps {
  backupTimestamp: Date | null;
  onRestore: () => void;
  onDismiss: () => void;
}

export function BackupRecoveryBanner({ backupTimestamp, onRestore, onDismiss }: BackupRecoveryBannerProps) {
  if (!backupTimestamp) return null;

  const formattedTime = backupTimestamp.toLocaleString();

  return (
    <Alert variant="default" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="text-sm">Unsaved changes found from {formattedTime}. Would you like to restore them?</span>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={onRestore}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Restore
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
