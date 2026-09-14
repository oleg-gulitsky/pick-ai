import { useCallback, useState } from 'react';
import { useQuizStore } from '../../../store/useQuizStore';
import { usePendingStore } from '../../../store/usePendingStore';
import { useAppConfigStore } from '../../../store/useAppConfigStore';
import { tryShowInterstitial } from '../../../services/ads';
import { useAppNavigation } from '../..';

export function useOptionsForm() {
  const navigation = useAppNavigation();
  const isPending = usePendingStore.use.isPending();
  const setIsPendingTrue = usePendingStore.use.setIsPendingTrue();
  const isConfigReady = useAppConfigStore.use.isConfigReady();
  const setOptions = useQuizStore.use.setOptions();

  const [firstOption, setFirstOption] = useState('');
  const [secondOption, setSecondOption] = useState('');

  const canSubmit =
    Boolean(firstOption && secondOption) && isConfigReady && !isPending;

  const handleFirstOptionChange = useCallback(
    (value: string) => setFirstOption(value),
    [],
  );
  const handleSecondOptionChange = useCallback(
    (value: string) => setSecondOption(value),
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;

    tryShowInterstitial();
    setOptions(firstOption, secondOption);
    setIsPendingTrue();
    navigation.replace('Quiz');
  }, [
    canSubmit,
    firstOption,
    navigation,
    secondOption,
    setIsPendingTrue,
    setOptions,
  ]);

  return {
    firstOption,
    secondOption,
    canSubmit,
    handleFirstOptionChange,
    handleSecondOptionChange,
    handleSubmit,
  };
}
