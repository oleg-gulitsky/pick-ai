import { useCallback } from 'react';
import { useAppNavigation } from '../..';
import { useQuizStore } from '../../../store/useQuizStore';

export function useResult() {
  const navigation = useAppNavigation();

  const result = useQuizStore.use.result();
  const questionsCount = useQuizStore.use.questions().length;
  const resetQuiz = useQuizStore.use.resetQuiz();

  const handleNewDecisionPress = useCallback(() => {
    resetQuiz();
    navigation.replace('Options');
  }, [navigation, resetQuiz]);

  const handleOpenInHistoryPress = useCallback(() => {
    if (!result) return;

    navigation.navigate('HistoryTab', {
      screen: 'HistoryDetails',
      params: { id: result.savedId },
      initial: false,
    });
  }, [navigation, result]);

  return {
    result,
    questionsCount,
    handleNewDecisionPress,
    handleOpenInHistoryPress,
  };
}
