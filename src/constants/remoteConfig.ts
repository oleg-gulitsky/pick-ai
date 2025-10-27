import { MODELS } from './models';
import { createKeys } from '../tools/createKeys';

export const REMOTE_CONFIG_DEFAULTS = {
  current_model: MODELS.Deepseek_R1_0528_Qwen3_8B,
};

export const REMOTE_CONFIG_KEYS = createKeys(REMOTE_CONFIG_DEFAULTS);
