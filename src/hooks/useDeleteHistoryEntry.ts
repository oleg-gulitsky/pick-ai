import { useCallback } from 'react';
import { Alert } from 'react-native';
import { STRINGS } from '../constants/strings';
import { HistoryEntry, useHistoryStore } from '../store/useHistoryStore';

export function useDeleteHistoryEntry() {
  const removeEntry = useHistoryStore.use.removeEntry();

  return useCallback(
    (id: HistoryEntry['id'], onDeleted?: () => void) => {
      Alert.alert(
        STRINGS.DELETE_ENTRY_ALERT_TITLE,
        STRINGS.DELETE_ENTRY_ALERT_MESSAGE,
        [
          { text: STRINGS.ALERT_CANCEL_BUTTON_TITLE, style: 'cancel' },
          {
            text: STRINGS.DELETE_ENTRY_ALERT_CONFIRM,
            style: 'destructive',
            onPress: () => {
              onDeleted?.();
              removeEntry(id);
            },
          },
        ],
      );
    },
    [removeEntry],
  );
}
