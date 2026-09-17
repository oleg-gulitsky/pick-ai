import { useEffect } from 'react';
import Config from 'react-native-config';
import { initAds } from '../services/ads';
import {
  getRemoteBoolean,
  getRemoteValue,
  initRemoteConfig,
} from '../services/remoteConfig';
import { fetchIsStructuredOutputsSupported } from '../services/ai';
import { useAppConfigStore } from '../store/useAppConfigStore';
import {
  REMOTE_CONFIG_DEFAULTS,
  REMOTE_CONFIG_KEYS,
} from '../constants/remoteConfig';

export const DETECTION_TIMEOUT_MS = 5_000;

export function useAppInit() {
  const setIsConfigReadyTrue = useAppConfigStore.use.setIsConfigReadyTrue();
  const setIsAdsEnabledTrue = useAppConfigStore.use.setIsAdsEnabledTrue();
  const setAIModels = useAppConfigStore.use.setAIModels();
  const setOpenRouterAPIKey = useAppConfigStore.use.setOpenRouterAPIKey();
  const setStructuredOutputModels =
    useAppConfigStore.use.setStructuredOutputModels();

  useEffect(() => {
    initRemoteConfig({
      configDefaults: REMOTE_CONFIG_DEFAULTS,
    }).then(() => {
      try {
        const models: unknown = JSON.parse(
          getRemoteValue(REMOTE_CONFIG_KEYS.AI_MODELS),
        );

        if (!isModelList(models)) {
          throw new Error('AI models config is not a list of model names');
        }

        setAIModels(models);
        // The check does not block the UI, a questions request waits for it.
        setStructuredOutputModels(null);
        findStructuredOutputModels(models).then(setStructuredOutputModels);
        setOpenRouterAPIKey(
          getRemoteValue(REMOTE_CONFIG_KEYS.OPENROUTER_API_KEY),
        );
      } catch (error) {
        console.error('Failed to apply AI config:', error);
      } finally {
        setIsConfigReadyTrue();
      }

      if (getRemoteBoolean(REMOTE_CONFIG_KEYS.ADS_ENABLED)) {
        initAds({
          appodealAppKey: Config.APPODEAL_APP_KEY,
        });
        setIsAdsEnabledTrue();
      }
    });
  }, [
    setAIModels,
    setIsAdsEnabledTrue,
    setIsConfigReadyTrue,
    setOpenRouterAPIKey,
    setStructuredOutputModels,
  ]);
}

// A failed or hanging check counts as unsupported,
// so requests to that model fall back to the prompt.
async function checkStructuredOutputs(model: string): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DETECTION_TIMEOUT_MS);

  try {
    return await fetchIsStructuredOutputsSupported(model, controller.signal);
  } catch (error) {
    console.warn(error);
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

function isModelList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every(model => typeof model === 'string')
  );
}

async function findStructuredOutputModels(models: string[]): Promise<string[]> {
  const supported = await Promise.all(models.map(checkStructuredOutputs));
  return models.filter((_model, index) => supported[index]);
}
