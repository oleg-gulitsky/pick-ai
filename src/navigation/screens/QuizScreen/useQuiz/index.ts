import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuizStore } from '../../../../store/useQuizStore';
import { useHistoryStore } from '../../../../store/useHistoryStore';
import { useSettingsStore } from '../../../../store/useSettingsStore';
import { useAppNavigation } from '../../..';
import { tryShowInterstitial } from '../../../../services/ads';
import { useAIRequests } from './useAIRequests';
import { useScreenRequest } from './useScreenRequest';

export function useQuiz() {
  const navigation = useAppNavigation();
  const { runRequest, isRequestInFlight, cancelRequest } = useScreenRequest();
  const { requestQuestions, requestResult } = useAIRequests();
  const options = useQuizStore.use.options();
  const questions = useQuizStore.use.questions();
  const answers = useQuizStore.use.answers();
  const questionIndex = useQuizStore.use.currentQuestionIndex();
  const addAnswer = useQuizStore.use.addAnswer();
  const goToPreviousQuestion = useQuizStore.use.goToPreviousQuestion();
  const setQuestions = useQuizStore.use.setQuestions();
  const setResult = useQuizStore.use.setResult();
  const resetProgress = useQuizStore.use.resetProgress();
  const addHistoryEntry = useHistoryStore.use.addEntry();

  const [hasError, setHasError] = useState(false);
  const isOpenedRef = useRef(false);

  const showError = useCallback(() => setHasError(true), []);

  const loadQuestions = useCallback(() => {
    const { questionRange, answerRange } = useSettingsStore.getState();

    runRequest(
      signal =>
        requestQuestions(options, { questionRange, answerRange }, signal),
      setQuestions,
      showError,
    );
  }, [options, requestQuestions, runRequest, setQuestions, showError]);

  const loadResult = useCallback(() => {
    const quiz = useQuizStore.getState();

    runRequest(
      signal => requestResult(options, quiz.questions, quiz.answers, signal),
      ({ winner, explanation }) => {
        const savedId = addHistoryEntry({
          options,
          winner,
          explanation,
          questions: quiz.questions,
          answers: quiz.answers,
        });
        setResult({ winner, explanation, savedId });
        navigation.replace('Result');
      },
      showError,
    );
  }, [
    addHistoryEntry,
    navigation,
    options,
    requestResult,
    runRequest,
    setResult,
    showError,
  ]);

  useEffect(() => {
    if (isOpenedRef.current) return;

    isOpenedRef.current = true;

    if (options.length > 0 && questions.length === 0) {
      loadQuestions();
    }
  }, [loadQuestions, options.length, questions.length]);

  const handleAnswerPress = useCallback(
    (value: number) => {
      if (isRequestInFlight()) return;

      addAnswer(questionIndex, value);

      if (questionIndex < questions.length - 1) return;

      tryShowInterstitial();
      loadResult();
    },
    [addAnswer, isRequestInFlight, loadResult, questionIndex, questions.length],
  );

  const handleBackPress = useCallback(() => {
    if (isRequestInFlight() || questionIndex === 0) return;

    goToPreviousQuestion();
  }, [goToPreviousQuestion, isRequestInFlight, questionIndex]);

  const handleCancelPress = useCallback(() => {
    cancelRequest();

    if (questions.length > 0) {
      goToPreviousQuestion();
    } else {
      navigation.replace('Options');
    }
  }, [cancelRequest, goToPreviousQuestion, navigation, questions.length]);

  const handleRetryPress = useCallback(() => {
    setHasError(false);

    if (questions.length > 0) {
      loadResult();
    } else {
      loadQuestions();
    }
  }, [loadQuestions, loadResult, questions.length]);

  const handleBackToOptionsPress = useCallback(() => {
    setHasError(false);
    resetProgress();
    navigation.replace('Options');
  }, [navigation, resetProgress]);

  return {
    options,
    question: questions[questionIndex],
    questionIndex,
    questionsCount: questions.length,
    selectedAnswer: answers[questionIndex],
    isWaitingForResult: questions.length > 0,
    canGoBack: questionIndex > 0,
    hasError,
    handleAnswerPress,
    handleBackPress,
    handleCancelPress,
    handleRetryPress,
    handleBackToOptionsPress,
  };
}
