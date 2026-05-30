import { useCallback, useState } from 'react';
import { ApiError } from '../api/http';
import { safeMessage } from '../utils/security';

type AsyncState<T> = {
  readonly loading: boolean;
  readonly data: T | null;
  readonly error: string | null;
};

export const useAsyncAction = <T>() => {
  const [state, setState] = useState<AsyncState<T>>({ loading: false, data: null, error: null });

  const run = useCallback(async (action: () => Promise<T>): Promise<T | null> => {
    setState((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const data = await action();
      setState({ loading: false, data, error: null });
      return data;
    } catch (error) {
      const message = error instanceof ApiError
        ? `${error.code}: ${error.message}`
        : safeMessage(error instanceof Error ? error.message : 'Unexpected error');
      setState((previous) => ({ ...previous, loading: false, error: message }));
      return null;
    }
  }, []);

  const reset = useCallback(() => setState({ loading: false, data: null, error: null }), []);

  return { ...state, run, reset } as const;
};
