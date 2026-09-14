import { useCallback, useState } from 'react';
import { useQuizStore } from '../../../store/useQuizStore';
import { usePendingStore } from '../../../store/usePendingStore';
import { tryShowInterstitial } from '../../../services/ads';
import { useAppNavigation } from '../..';

export function useOptionsForm() {
  const navigation = useAppNavigation();
  const setIsPendingTrue = usePendingStore.use.setIsPendingTrue();
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
  }, [
    firstOption,
    isValid,
    navigation,
    secondOption,
    setIsPendingTrue,
    setOptions,
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
