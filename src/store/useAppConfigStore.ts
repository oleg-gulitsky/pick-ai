import { create } from 'zustand';
import { createSelectors } from './createSelectors';

const useAppConfigStoreBase = create<State & Action>(set => ({
  isConfigReady: false,
  isAdsEnabled: false,
  aiModels: [],
  openRouterAPIKey: '',
  structuredOutputModels: [],
  setIsConfigReadyTrue: () => set(() => ({ isConfigReady: true })),
  setIsAdsEnabledTrue: () => set(() => ({ isAdsEnabled: true })),
  setAIModels: aiModels => set(() => ({ aiModels })),
  setOpenRouterAPIKey: openRouterAPIKey => set(() => ({ openRouterAPIKey })),
  setStructuredOutputModels: structuredOutputModels =>
    set(() => ({ structuredOutputModels })),
}));

export const useAppConfigStore = createSelectors(useAppConfigStoreBase);

type State = {
  isConfigReady: boolean;
  isAdsEnabled: boolean;
  aiModels: string[];
  openRouterAPIKey: string;
  structuredOutputModels: string[] | null;
};

type Action = {
  setIsConfigReadyTrue: () => void;
  setIsAdsEnabledTrue: () => void;
  setAIModels: (aiModels: State['aiModels']) => void;
  setOpenRouterAPIKey: (openRouterAPIKey: State['openRouterAPIKey']) => void;
  setStructuredOutputModels: (
    structuredOutputModels: State['structuredOutputModels'],
  ) => void;
};
