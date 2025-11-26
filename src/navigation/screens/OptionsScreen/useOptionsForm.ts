import { useCallback, useState } from 'react';
import { useQuizStore } from '../../../store/useQuizStore';
import { usePendingStore } from '../../../store/usePendingStore';
import { tryGetQuestions } from '../../../modules/ai';
import { tryShowInterstitial } from '../../../modules/ads';
import { useAppNavigation } from '../..';
import { useHandleServiceError } from '../../../hooks/useHandleServiceError';

export function useOptionsForm() {
  const navigation = useAppNavigation();
  const handleServiceError = useHandleServiceError();
  const setIsPendingFalse = usePendingStore.use.setIsPendingFalse();
  const setIsPendingTrue = usePendingStore.use.setIsPendingTrue();
  const setQuestions = useQuizStore.use.setQuestions();
  const setOptions = useQuizStore.use.setOptions();

  const [firstOption, setFirstOption] = useState('');
  const [secondOption, setSecondOption] = useState('');

  const isValid = Boolean(firstOption && secondOption);

  const handleFirstOptionChange = useCallback(
    (value: string) => setFirstOption(value),
    [],
  );
  const handleSecondOptionChange = useCallback(
    (value: string) => setSecondOption(value),
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!isValid) return;

    tryShowInterstitial();
    setOptions(firstOption, secondOption);
    setIsPendingTrue();
    navigation.replace('Quiz');

    tryGetQuestions(firstOption, secondOption)
      .then(res => {
        if (res) {
          setQuestions(res);
        } else {
          handleServiceError('Options');
        }
      })
      .catch(() => {
        handleServiceError('Options');
      })
      .finally(() => {
        setIsPendingFalse();
      });
  }, [
    firstOption,
    handleServiceError,
    isValid,
    navigation,
    secondOption,
    setIsPendingFalse,
    setIsPendingTrue,
    setOptions,
    setQuestions,
  ]);

  return {
    firstOption,
    secondOption,
    isValid,
    handleFirstOptionChange,
    handleSecondOptionChange,
    handleSubmit,
  };
}
