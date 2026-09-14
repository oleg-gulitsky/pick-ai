import { create } from 'zustand';
import { createSelectors } from './createSelectors';

type State = {
  isConfigReady: boolean;
};

type Action = {
  setIsConfigReadyTrue: () => void;
};

const useAppConfigStoreBase = create<State & Action>(set => ({
  isConfigReady: false,
  setIsConfigReadyTrue: () => set(() => ({ isConfigReady: true })),
}));

export const useAppConfigStore = createSelectors(useAppConfigStoreBase);
