import { useEffect } from 'react';
import Config from 'react-native-config';
import { initAds } from '../services/ads';
import {
  getRemoteBoolean,
  getRemoteValue,
  initRemoteConfig,
} from '../services/remoteConfig';
import {
  detectStructuredOutputSupport,
  setAIModels,
  setOpenRouterAPIKey,
} from '../services/ai';
import { useAppConfigStore } from '../store/useAppConfigStore';
import {
  REMOTE_CONFIG_DEFAULTS,
  REMOTE_CONFIG_KEYS,
} from '../constants/remoteConfig';

export function useAppInit() {
  const setIsConfigReadyTrue = useAppConfigStore.use.setIsConfigReadyTrue();

  useEffect(() => {
    initRemoteConfig({
      configDefaults: REMOTE_CONFIG_DEFAULTS,
    }).then(() => {
      try {
        const models = JSON.parse(getRemoteValue(REMOTE_CONFIG_KEYS.AI_MODELS));
        setAIModels(models);
        detectStructuredOutputSupport(models);
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
      }
    });
  }, [setIsConfigReadyTrue]);
}
