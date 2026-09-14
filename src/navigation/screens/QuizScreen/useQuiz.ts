import { useCallback, useEffect } from 'react';
import { useQuizStore } from '../../../store/useQuizStore';
import { useAppNavigation } from '../..';
import { tryShowInterstitial } from '../../../services/ads';
import { tryGetQuestions, tryGetResult } from '../../../services/ai';
import { useHandleServiceError } from '../../../hooks/useHandleServiceError';
import { useScreenRequest } from '../../../hooks/useScreenRequest';

export function useQuiz() {
  const navigation = useAppNavigation();
  const handleServiceError = useHandleServiceError();
  const { runRequest, isRequestInFlight } = useScreenRequest();
  const firstOption = useQuizStore.use.firstOption();
  const secondOption = useQuizStore.use.secondOption();
  const questions = useQuizStore.use.questions();
  const questionIndex = useQuizStore.use.currentQuestionIndex();
  const addAnswer = useQuizStore.use.addAnswer();
  const setQuestions = useQuizStore.use.setQuestions();
  const setResult = useQuizStore.use.setResult();
  const resetQuiz = useQuizStore.use.resetQuiz();

  const failQuiz = useCallback(() => {
    resetQuiz();
    handleServiceError('Options');
  }, [handleServiceError, resetQuiz]);

  useEffect(() => {
    if (!firstOption || !secondOption || questions.length > 0) return;

    runRequest(
      signal => tryGetQuestions(firstOption, secondOption, signal),
      res => {
        if (res) {
          setQuestions(res);
        } else {
          failQuiz();
        }
      },
      failQuiz,
    );
  }, [
    failQuiz,
    firstOption,
    questions.length,
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
        tryGetResult([firstOption, secondOption], questions, answers, signal),
      res => {
        setResult(res);
        navigation.replace('Result');
      },
      failQuiz,
    );
  };

  return {
    handleOptionPress,
    question,
  };
}
