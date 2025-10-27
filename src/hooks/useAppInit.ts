import { useEffect } from 'react';
import Config from 'react-native-config';
import { initAds } from '../modules/ads';
import { getRemoteValue, initRemoteConfig } from '../modules/remoteConfig';
import { setCurrentModel } from '../services/openRouterAI';
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
      setCurrentModel(getRemoteValue(REMOTE_CONFIG_KEYS.CURRENT_MODEL));
    });
  }, []);
}
