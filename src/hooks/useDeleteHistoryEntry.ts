import { useCallback, useState } from 'react';
import { HistoryEntry, useHistoryStore } from '../store/useHistoryStore';

export function useDeleteHistoryEntry() {
  const removeEntry = useHistoryStore.use.removeEntry();
  const [pendingDeletion, setPendingDeletion] =
    useState<PendingDeletion | null>(null);

  const requestDelete = useCallback(
    (id: HistoryEntry['id'], onDeleted?: () => void) =>
      setPendingDeletion({ id, onDeleted }),
    [],
  );

  const confirmDelete = useCallback(() => {
    if (!pendingDeletion) return;

    setPendingDeletion(null);
    pendingDeletion.onDeleted?.();
    removeEntry(pendingDeletion.id);
  }, [pendingDeletion, removeEntry]);

  const cancelDelete = useCallback(() => setPendingDeletion(null), []);

  return {
    isDeleteDialogVisible: pendingDeletion !== null,
    requestDelete,
    confirmDelete,
    cancelDelete,
  };
}

type PendingDeletion = {
  id: HistoryEntry['id'];
  onDeleted?: () => void;
};
