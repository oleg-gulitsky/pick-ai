import { MODELS } from './models';
import Config from 'react-native-config';
import { createKeys } from '../tools/createKeys';

export const REMOTE_CONFIG_DEFAULTS = {
  current_model: MODELS.Deepseek_R1_0528_Qwen3_8B,
  openrouter_api_key: Config.OPEN_ROUTER_API_KEY,
  ai_models: JSON.stringify([
    'google/gemma-3n-e2b-it:free',
    'x-ai/grok-4.1-fast:free',
    'nvidia/nemotron-nano-9b-v2:free',
    'kwaipilot/kat-coder-pro:free',
    'alibaba/tongyi-deepresearch-30b-a3b:free'
  ]),
};

export const REMOTE_CONFIG_KEYS = createKeys(REMOTE_CONFIG_DEFAULTS);
