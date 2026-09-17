import TestRenderer, { act, ReactTestRenderer } from 'react-test-renderer';
import { useScreenRequest } from '../src/navigation/screens/QuizScreen/useQuiz/useScreenRequest';
import { usePendingStore } from '../src/store/usePendingStore';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const flushPromises = () => new Promise(resolve => setImmediate(resolve));

const isPending = () => usePendingStore.getState().isPending;

let api: ReturnType<typeof useScreenRequest>;

function Probe() {
  api = useScreenRequest();
  return null;
}

describe('useScreenRequest', () => {
  let renderer: ReactTestRenderer | null = null;
  const onSuccess = jest.fn();
  const onError = jest.fn();

  function unmount() {
    act(() => renderer?.unmount());
    renderer = null;
  }

  beforeEach(() => {
    onSuccess.mockReset();
    onError.mockReset();
    usePendingStore.getState().setIsPendingFalse();
    act(() => {
      renderer = TestRenderer.create(<Probe />);
    });
  });

  afterEach(unmount);

  test('keeps the spinner while in flight and passes the response on', async () => {
    const response = deferred<string>();

    act(() => {
      api.runRequest(() => response.promise, onSuccess, onError);
    });
    expect(isPending()).toBe(true);
    expect(api.isRequestInFlight()).toBe(true);

    await act(async () => {
      response.resolve('answer');
      await flushPromises();
    });

    expect(onSuccess).toHaveBeenCalledWith('answer');
    expect(onError).not.toHaveBeenCalled();
    expect(isPending()).toBe(false);
    expect(api.isRequestInFlight()).toBe(false);
  });

  test('reports a failed request and releases the spinner', async () => {
    await act(async () => {
      api.runRequest(
        () => Promise.reject(new Error('failed')),
        onSuccess,
        onError,
      );
      await flushPromises();
    });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(isPending()).toBe(false);
  });

  test('refuses a second request while one is in flight', () => {
    const request = jest.fn(() => new Promise<string>(() => {}));

    act(() => {
      expect(api.runRequest(request, onSuccess, onError)).toBe(true);
      expect(api.runRequest(request, onSuccess, onError)).toBe(false);
    });

    expect(request).toHaveBeenCalledTimes(1);
  });

  test('accepts a new request once the previous one has settled', async () => {
    const request = jest.fn(async () => 'answer');

    await act(async () => {
      api.runRequest(request, onSuccess, onError);
      await flushPromises();
    });
    await act(async () => {
      expect(api.runRequest(request, onSuccess, onError)).toBe(true);
      await flushPromises();
    });

    expect(request).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledTimes(2);
  });

  test('aborts on unmount and drops a response that arrives later', async () => {
    const response = deferred<string>();
    let signal!: AbortSignal;

    act(() => {
      api.runRequest(
        requestSignal => {
          signal = requestSignal;
          return response.promise;
        },
        onSuccess,
        onError,
      );
    });
    unmount();

    expect(signal.aborted).toBe(true);
    expect(isPending()).toBe(false);

    // The next screen has started its own request by the time the stale one lands.
    usePendingStore.getState().setIsPendingTrue();
    await act(async () => {
      response.resolve('late answer');
      await flushPromises();
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(isPending()).toBe(true);
  });

  test('drops a failure that arrives after unmount', async () => {
    const response = deferred<string>();

    act(() => {
      api.runRequest(() => response.promise, onSuccess, onError);
    });
    unmount();
    await act(async () => {
      response.reject(new Error('AI request was aborted'));
      await flushPromises();
    });

    expect(onError).not.toHaveBeenCalled();
  });
});
