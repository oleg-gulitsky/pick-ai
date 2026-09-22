import { useCallback, useState } from 'react';
import { useHistoryStore } from '../../../store/useHistoryStore';
import { useSettingsStore } from '../../../store/useSettingsStore';

export function useSettings() {
  const historySize = useHistoryStore.use.entries().length;
  const clearHistory = useHistoryStore.use.clearHistory();
  const theme = useSettingsStore.use.theme();
  const setTheme = useSettingsStore.use.setTheme();
  const questionRange = useSettingsStore.use.questionRange();
  const setQuestionRange = useSettingsStore.use.setQuestionRange();
  const answerRange = useSettingsStore.use.answerRange();
  const setAnswerRange = useSettingsStore.use.setAnswerRange();

  const [isClearDialogVisible, setIsClearDialogVisible] = useState(false);

  const handleClearHistoryPress = useCallback(
    () => setIsClearDialogVisible(true),
    [],
  );

  const handleClearHistoryConfirm = useCallback(() => {
    setIsClearDialogVisible(false);
    clearHistory();
  }, [clearHistory]);

  const handleClearHistoryCancel = useCallback(
    () => setIsClearDialogVisible(false),
    [],
  );

  return {
    historySize,
    canClearHistory: historySize > 0,
    theme,
    questionRange,
    answerRange,
    isClearDialogVisible,
    handleThemeChange: setTheme,
    handleQuestionRangeChange: setQuestionRange,
    handleAnswerRangeChange: setAnswerRange,
    handleClearHistoryPress,
    handleClearHistoryConfirm,
    handleClearHistoryCancel,
  };
}
