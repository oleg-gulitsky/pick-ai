import { useCallback, useMemo, useState } from 'react';
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
  const startQuiz = useQuizStore.use.startQuiz();

  const [form, setForm] = useState(createForm);

  const options = useMemo(
    () =>
      form.options.map((option, index) => ({
        ...option,
        isRemovable: index >= MIN_OPTIONS,
      })),
    [form.options],
  );
  const trimmedOptions = useMemo(
    () => form.options.map(option => option.text.trim()),
    [form.options],
  );
  const canSubmit =
    trimmedOptions.every(option => option.length > 0) &&
    isConfigReady &&
    !isPending;
  const canAddOption = form.options.length < MAX_OPTIONS;

  const handleOptionChange = useCallback(
    (index: number, text: string) =>
      setForm(current => ({
        ...current,
        options: current.options.map((option, optionIndex) =>
          optionIndex === index
            ? { ...option, text: text.replace(/\n/g, ' ') }
            : option,
        ),
      })),
    [],
  );

  const handleAddOptionPress = useCallback(
    () =>
      setForm(current =>
        current.options.length < MAX_OPTIONS
          ? {
              options: [...current.options, { key: current.nextKey, text: '' }],
              nextKey: current.nextKey + 1,
              autoFocusKey: current.nextKey,
            }
          : current,
      ),
    [],
  );

  const handleRemoveOptionPress = useCallback(
    (index: number) =>
      setForm(current =>
        index >= MIN_OPTIONS
          ? {
              ...current,
              options: current.options.filter(
                (_option, optionIndex) => optionIndex !== index,
              ),
            }
          : current,
      ),
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;

    tryShowInterstitial();
    startQuiz(trimmedOptions);
    setIsPendingTrue();
    navigation.replace('Quiz');
  }, [canSubmit, navigation, setIsPendingTrue, startQuiz, trimmedOptions]);

  return {
    options,
    autoFocusKey: form.autoFocusKey,
    canSubmit,
    canAddOption,
    handleOptionChange,
    handleAddOptionPress,
    handleRemoveOptionPress,
    handleSubmit,
  };
}

type OptionRow = {
  key: number;
  text: string;
};

type OptionsForm = {
  options: OptionRow[];
  nextKey: number;
  autoFocusKey: number | null;
};

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;

function createForm(): OptionsForm {
  const savedOptions = useQuizStore.getState().options;
  const texts = savedOptions.length >= MIN_OPTIONS ? savedOptions : ['', ''];

  return {
    options: texts.map((text, key) => ({ key, text })),
    nextKey: texts.length,
    autoFocusKey: null,
  };
}
