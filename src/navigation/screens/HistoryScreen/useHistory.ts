import { useCallback } from 'react';
import { useAppNavigation } from '../..';
import { useDeleteHistoryEntry } from '../../../hooks/useDeleteHistoryEntry';
import { useHistoryStore } from '../../../store/useHistoryStore';

export function useHistory() {
  const navigation = useAppNavigation();
  const { isDeleteDialogVisible, requestDelete, confirmDelete, cancelDelete } =
    useDeleteHistoryEntry();
  const entries = useHistoryStore.use.entries();

  const handleEntryPress = useCallback(
    (id: string) => navigation.navigate('HistoryDetails', { id }),
    [navigation],
  );

  const handleEntryLongPress = useCallback(
    (id: string) => requestDelete(id),
    [requestDelete],
  );

  const handleStartDecisionPress = useCallback(
    () => navigation.navigate('NewDecisionTab'),
    [navigation],
  );

  return {
    entries,
    isDeleteDialogVisible,
    handleEntryPress,
    handleEntryLongPress,
    handleStartDecisionPress,
    handleDeleteConfirm: confirmDelete,
    handleDeleteCancel: cancelDelete,
  };
}
