import { create } from 'zustand';
import { createSelectors } from './createSelectors';

type State = {
  isConfigReady: boolean;
  isAdsEnabled: boolean;
};

type Action = {
  setIsConfigReadyTrue: () => void;
  setIsAdsEnabledTrue: () => void;
};

const useAppConfigStoreBase = create<State & Action>(set => ({
  isConfigReady: false,
  isAdsEnabled: false,
  setIsConfigReadyTrue: () => set(() => ({ isConfigReady: true })),
  setIsAdsEnabledTrue: () => set(() => ({ isAdsEnabled: true })),
}));

export const useAppConfigStore = createSelectors(useAppConfigStoreBase);
