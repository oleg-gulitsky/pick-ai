import { useEffect } from 'react';
import { usePendingStore } from '../../../store/usePendingStore';
import { useQuizStore } from '../../../store/useQuizStore';
import { useAppNavigation } from '../..';
import { tryShowInterstitial } from '../../../modules/ads';
import { tryGetResult } from '../../../modules/ai';
import { useHandleServiceError } from '../../../hooks/useHandleServiceError';

export function useQuiz() {
  const navigation = useAppNavigation();
  const handleServiceError = useHandleServiceError();
  const firstOption = useQuizStore.use.firstOption();
  const secondOption = useQuizStore.use.secondOption();
  const questions = useQuizStore.use.questions();
  const questionIndex = useQuizStore.use.currentQuestionIndex();
  const answers = useQuizStore.use.answers();
  const addAnswer = useQuizStore.use.addAnswer();
  const setIsPendingTrue = usePendingStore.use.setIsPendingTrue();
  const setIsPendingFalse = usePendingStore.use.setIsPendingFalse();
  const setResult = useQuizStore.use.setResult();
  const resetQuiz = useQuizStore.use.resetQuiz();

  useEffect(() => {
    if (questions.length > 0 && answers.length >= questions.length) {
      setIsPendingTrue();
      tryShowInterstitial();
      tryGetResult([firstOption, secondOption], questions, answers)
        .then(res => {
          setResult(res);
          navigation.replace('Result');
        })
        .catch(() => {
          resetQuiz();
          handleServiceError('Options');
        })
        .finally(() => setIsPendingFalse());
    }
  }, [
    answers,
    firstOption,
    handleServiceError,
    navigation,
    questions,
    resetQuiz,
    secondOption,
    setIsPendingFalse,
    setIsPendingTrue,
    setResult,
  ]);

  const question = questions[questionIndex];

  const handleOptionPress = (value: number) => {
    addAnswer(questionIndex, value);
  };

  return {
    handleOptionPress,
    question,
  };
}
