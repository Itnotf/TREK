import { useCallback } from 'react';
import { useNavigate } from 'react-router';

/** Return within the app; a direct link needs a safe destination instead. */
export function useBackNavigation(fallback: string): () => void {
  const navigate = useNavigate();
  return useCallback(() => {
    const index = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof index === 'number' && index > 0) void navigate(-1);
    else void navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}
