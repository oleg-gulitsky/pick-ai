import { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useQuizStore } from '../../../../store/useQuizStore';
import { useHistoryStore } from '../../../../store/useHistoryStore';
import { usePendingStore } from '../../../../store/usePendingStore';
import { useAppNavigation } from '../../..';
import { tryShowInterstitial } from '../../../../services/ads';
import { STRINGS } from '../../../../constants/strings';
import { useAIRequests } from './useAIRequests';
import { useScreenRequest } from './useScreenRequest';

export function useQuiz() {
  const navigation = useAppNavigation();
  const { runRequest, isRequestInFlight } = useScreenRequest();
  const { requestQuestions, requestResult } = useAIRequests();
  const firstOption = useQuizStore.use.firstOption();
  const secondOption = useQuizStore.use.secondOption();
  const questions = useQuizStore.use.questions();
  const questionIndex = useQuizStore.use.currentQuestionIndex();
  const addAnswer = useQuizStore.use.addAnswer();
  const setQuestions = useQuizStore.use.setQuestions();
  const setResult = useQuizStore.use.setResult();
  const resetQuiz = useQuizStore.use.resetQuiz();
  const addHistoryEntry = useHistoryStore.use.addEntry();
  const isPending = usePendingStore.use.isPending();

  const failQuiz = useCallback(() => {
    resetQuiz();
    Alert.alert(
      STRINGS.SERVICE_ERROR_ALERT_TITLE,
      STRINGS.SERVICE_ERROR_ALERT_MESSAGE,
    );
    navigation.replace('Options');
  }, [navigation, resetQuiz]);

  useEffect(() => {
    if (!firstOption || !secondOption || questions.length > 0) return;

    runRequest(
      signal => requestQuestions(firstOption, secondOption, signal),
      setQuestions,
      failQuiz,
    );
  }, [
    failQuiz,
    firstOption,
    questions.length,
    requestQuestions,
    runRequest,
    secondOption,
    setQuestions,
  ]);

  const question = questions[questionIndex];

  const handleOptionPress = (value: number) => {
    if (isRequestInFlight()) return;

    addAnswer(questionIndex, value);

    if (questionIndex < questions.length - 1) return;

    const { answers } = useQuizStore.getState();
    tryShowInterstitial();
    runRequest(
      signal =>
        requestResult([firstOption, secondOption], questions, answers, signal),
      res => {
        setResult(res);
        addHistoryEntry({
          firstOption,
          secondOption,
          questions,
          answers,
          result: res,
        });
        navigation.replace('Result');
      },
      failQuiz,
    );
  };

  return {
    handleOptionPress,
    question,
    isPending,
  };
}
