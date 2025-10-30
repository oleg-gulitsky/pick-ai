import { useState } from 'react';
import { useQuizStore } from '../../../store/useQuizStore';
import { usePendingStore } from '../../../store/usePendingStore';
import { tryGetQuestions } from '../../../modules/ai';
import { tryShowInterstitial } from '../../../modules/ads';
import { useAppNavigation } from '../..';

export function useOptionsForm() {
  const navigation = useAppNavigation();
  const setIsPendingFalse = usePendingStore.use.setIsPendingFalse();
  const setIsPendingTrue = usePendingStore.use.setIsPendingTrue();
  const setQuestions = useQuizStore.use.setQuestions();
  const setOptions = useQuizStore.use.setOptions();

  const [firstOption, setFirstOption] = useState('');
  const [secondOption, setSecondOption] = useState('');

  const isValid = Boolean(firstOption && secondOption);

  const handleFirstOptionChange = (value: string) => setFirstOption(value);
  const handleSecondOptionChange = (value: string) => setSecondOption(value);

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      tryShowInterstitial();
      setOptions(firstOption, secondOption);
      setIsPendingTrue();
      navigation.replace('Quiz');

      const result = await tryGetQuestions(
        firstOption,
        secondOption,
      );

      if (result) {
        setQuestions(result);
      } else {
        navigation.replace('Options');
      }
    } catch (error) {
      navigation.replace('Options');
    } finally {
      setIsPendingFalse();
    }
  };

  return {
    firstOption,
    secondOption,
    isValid,
    handleFirstOptionChange,
    handleSecondOptionChange,
    handleSubmit,
  };
}
