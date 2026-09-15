import { useCallback } from 'react';
import { useAppNavigation } from '../..';
import { useDeleteHistoryEntry } from '../../../hooks/useDeleteHistoryEntry';
import { useHistoryStore } from '../../../store/useHistoryStore';

export function useHistory() {
  const navigation = useAppNavigation();
  const deleteEntry = useDeleteHistoryEntry();
  const entries = useHistoryStore.use.entries();

  const handleEntryPress = useCallback(
    (id: string) => navigation.navigate('HistoryDetails', { id }),
    [navigation],
  );

  const handleEntryLongPress = useCallback(
    (id: string) => deleteEntry(id),
    [deleteEntry],
  );

  return {
    entries,
    handleEntryPress,
    handleEntryLongPress,
  };
}
