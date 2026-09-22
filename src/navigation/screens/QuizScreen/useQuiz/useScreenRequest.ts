import { useCallback, useEffect, useRef } from 'react';
import { usePendingStore } from '../../../../store/usePendingStore';

export function useScreenRequest() {
  const setIsPendingTrue = usePendingStore.use.setIsPendingTrue();
  const setIsPendingFalse = usePendingStore.use.setIsPendingFalse();
  const currentRequestRef = useRef<AbortController | null>(null);

  const cancelRequest = useCallback(() => {
    const controller = currentRequestRef.current;

    if (controller) {
      currentRequestRef.current = null;
      controller.abort();
      setIsPendingFalse();
    }
  }, [setIsPendingFalse]);

  useEffect(() => cancelRequest, [cancelRequest]);

  const isRequestInFlight = useCallback(
    () => currentRequestRef.current !== null,
    [],
  );

  const runRequest = useCallback(
    <T>(
      request: (signal: AbortSignal) => Promise<T>,
      onSuccess: (response: T) => void,
      onError: () => void,
    ): boolean => {
      if (currentRequestRef.current) return false;

      const controller = new AbortController();
      currentRequestRef.current = controller;
      const isCurrent = () => currentRequestRef.current === controller;

      setIsPendingTrue();
      request(controller.signal)
        .then(response => {
          if (isCurrent()) {
            onSuccess(response);
          }
        })
        .catch(() => {
          if (isCurrent()) {
            onError();
          }
        })
        .finally(() => {
          if (isCurrent()) {
            currentRequestRef.current = null;
            setIsPendingFalse();
          }
        });

      return true;
    },
    [setIsPendingFalse, setIsPendingTrue],
  );

  return { runRequest, isRequestInFlight, cancelRequest };
}
