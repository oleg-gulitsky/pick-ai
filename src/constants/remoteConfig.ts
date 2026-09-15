import Config from 'react-native-config';
import { createKeys } from '../tools/createKeys';

export const REMOTE_CONFIG_DEFAULTS = {
  ads_enabled: false,
  openrouter_api_key: Config.OPEN_ROUTER_API_KEY,
  ai_models: JSON.stringify([
    'nvidia/nemotron-3-super-120b-a12b:free',
    'nex-agi/nex-n2.5-pro:free',
    'nex-agi/nex-n2.5-mini:free',
    'liquid/lfm-2.5-2.6b:free',
    'dots-studio/dots-3-note-preview:free',
  ]),
};

export const REMOTE_CONFIG_KEYS = createKeys(REMOTE_CONFIG_DEFAULTS);
