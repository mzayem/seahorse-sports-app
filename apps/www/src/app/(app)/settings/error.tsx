"use client";

import ErrorBoundary from "@/components/error-boundary";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Failed to load settings"
    />
  );
}
