import { MODELS } from './models';
import Config from 'react-native-config';
import { createKeys } from '../tools/createKeys';

export const REMOTE_CONFIG_DEFAULTS = {
  current_model: MODELS.Deepseek_R1_0528_Qwen3_8B,
  openrouter_api_key: Config.OPEN_ROUTER_API_KEY,
  ai_models: JSON.stringify([
    'openai/gpt-oss-20b:free',
    'deepseek/deepseek-chat-v3.1:free',
    'nvidia/nemotron-nano-9b-v2:free',
    'google/gemma-3n-e2b-it:free',
    'mistralai/mistral-small-3.2-24b-instruct:free',
  ]),
};

export const REMOTE_CONFIG_KEYS = createKeys(REMOTE_CONFIG_DEFAULTS);
