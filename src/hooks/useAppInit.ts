import { useEffect } from 'react';
import Config from 'react-native-config';
import { initAds } from '../services/ads';
import { getRemoteValue, initRemoteConfig } from '../services/remoteConfig';
import { setAIModels, setOpenRouterAPIKey } from '../services/ai';
import {
  REMOTE_CONFIG_DEFAULTS,
  REMOTE_CONFIG_KEYS,
} from '../constants/remoteConfig';

export function useAppInit() {
  useEffect(() => {
    initAds({
      appodealAppKey: Config.APPODEAL_APP_KEY,
    });
    initRemoteConfig({
      configDefaults: REMOTE_CONFIG_DEFAULTS,
    }).then(() => {
      setAIModels(JSON.parse(getRemoteValue(REMOTE_CONFIG_KEYS.AI_MODELS)));
      setOpenRouterAPIKey(
        getRemoteValue(REMOTE_CONFIG_KEYS.OPENROUTER_API_KEY),
      );
    });
  }, []);
}
