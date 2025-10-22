import { create } from 'zustand';
import { createSelectors } from './createSelectors';

type State = {
  isPending: boolean;
};

type Action = {
  setIsPendingTrue: () => void;
  setIsPendingFalse: () => void;
};

const usePendingStoreBase = create<State & Action>(set => ({
  isPending: false,
  setIsPendingTrue: () => set(() => ({ isPending: true })),
  setIsPendingFalse: () => set(() => ({ isPending: false })),
}));

export const usePendingStore = createSelectors(usePendingStoreBase);
