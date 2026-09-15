import Appodeal, {
  AppodealAdType,
  AppodealInterstitialEvents,
  AppodealRewardedEvents,
} from 'react-native-appodeal';
import { tryShowInterstitial, tryShowRewarded } from '../src/services/ads';

const mockListeners = new Map<string, Set<(event?: any) => void>>();

jest.mock('react-native-appodeal', () => ({
  __esModule: true,
  default: {
    canShow: jest.fn(),
    show: jest.fn(),
    addEventListener: jest.fn((event: string, handler: () => void) => {
      if (!mockListeners.has(event)) {
        mockListeners.set(event, new Set());
      }
      mockListeners.get(event)!.add(handler);
    }),
    removeEventListener: jest.fn((event: string, handler: () => void) => {
      mockListeners.get(event)?.delete(handler);
    }),
  },
  AppodealAdType: { INTERSTITIAL: 1, REWARDED_VIDEO: 32 },
  AppodealInterstitialEvents: {
    CLOSED: 'onInterstitialClosed',
    FAILED_TO_SHOW: 'onInterstitialFailedToShow',
  },
  AppodealRewardedEvents: {
    CLOSED: 'onRewardedVideoClosed',
    FAILED_TO_SHOW: 'onRewardedVideoFailedToShow',
  },
  AppodealBannerEvents: {},
  AppodealSdkEvents: {},
}));

function emit(event: string, payload?: unknown) {
  [...(mockListeners.get(event) ?? [])].forEach(handler => handler(payload));
}

function listenerCount() {
  return [...mockListeners.values()].reduce((sum, set) => sum + set.size, 0);
}

describe('ads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockListeners.clear();
    jest.mocked(Appodeal.canShow).mockReturnValue(true);
  });

  describe('tryShowInterstitial', () => {
    test('resolves false without showing when the ad is not ready', async () => {
      jest.mocked(Appodeal.canShow).mockReturnValue(false);

      await expect(tryShowInterstitial()).resolves.toBe(false);
      expect(Appodeal.show).not.toHaveBeenCalled();
      expect(listenerCount()).toBe(0);
    });

    test('resolves true when the ad is closed', async () => {
      const result = tryShowInterstitial('placement');

      expect(Appodeal.show).toHaveBeenCalledWith(
        AppodealAdType.INTERSTITIAL,
        'placement',
      );
      emit(AppodealInterstitialEvents.CLOSED);

      await expect(result).resolves.toBe(true);
      expect(listenerCount()).toBe(0);
    });

    test('resolves false when the ad fails to show', async () => {
      const result = tryShowInterstitial();

      emit(AppodealInterstitialEvents.FAILED_TO_SHOW);

      await expect(result).resolves.toBe(false);
      expect(listenerCount()).toBe(0);
    });
  });

  describe('tryShowRewarded', () => {
    test('resolves false without showing when the ad is not ready', async () => {
      jest.mocked(Appodeal.canShow).mockReturnValue(false);

      await expect(tryShowRewarded()).resolves.toBe(false);
      expect(Appodeal.show).not.toHaveBeenCalled();
      expect(listenerCount()).toBe(0);
    });

    test.each([
      [true, true],
      [false, false],
      [undefined, false],
    ])(
      'resolves %p -> %p when the ad is closed',
      async (isFinished, expected) => {
        const result = tryShowRewarded();

        expect(Appodeal.show).toHaveBeenCalledWith(
          AppodealAdType.REWARDED_VIDEO,
          undefined,
        );
        emit(AppodealRewardedEvents.CLOSED, { isFinished });

        await expect(result).resolves.toBe(expected);
        expect(listenerCount()).toBe(0);
      },
    );

    test('resolves false when the ad fails to show', async () => {
      const result = tryShowRewarded();

      emit(AppodealRewardedEvents.FAILED_TO_SHOW);

      await expect(result).resolves.toBe(false);
      expect(listenerCount()).toBe(0);
    });
  });
});
