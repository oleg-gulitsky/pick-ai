import { getAnalytics, logEvent } from '@react-native-firebase/analytics';

export type AnalyticsParams = Record<string, string | number>;

export const MAX_PARAM_VALUE_LENGTH = 100;

export async function trackEvent(name: string, params: AnalyticsParams = {}) {
  try {
    await logEvent(getAnalytics(), name, truncateParams(params));
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to log analytics event:', error);
    }
  }
}

function truncateParams(params: AnalyticsParams): AnalyticsParams {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      typeof value === 'string'
        ? value.slice(0, MAX_PARAM_VALUE_LENGTH)
        : value,
    ]),
  );
}
