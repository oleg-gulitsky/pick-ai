import { useCallback } from 'react';
import { Alert } from 'react-native';
import { STRINGS } from '../../../constants/strings';
import { useHistoryStore } from '../../../store/useHistoryStore';

export function useSettings() {
  const historySize = useHistoryStore.use.entries().length;
  const clearHistory = useHistoryStore.use.clearHistory();

  const handleClearHistoryPress = useCallback(() => {
    Alert.alert(
      STRINGS.CLEAR_HISTORY_ALERT_TITLE,
      STRINGS.CLEAR_HISTORY_ALERT_MESSAGE,
      [
        { text: STRINGS.ALERT_CANCEL_BUTTON_TITLE, style: 'cancel' },
        {
          text: STRINGS.CLEAR_HISTORY_ALERT_CONFIRM,
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ],
    );
  }, [clearHistory]);

  return {
    historySize,
    canClearHistory: historySize > 0,
    handleClearHistoryPress,
  };
}
