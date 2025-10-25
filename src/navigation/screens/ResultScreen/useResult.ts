import { useAppNavigation } from '../..';
import { useQuizStore } from '../../../store/useQuizStore';

export function useResult() {
  const navigation = useAppNavigation();

  const result = useQuizStore.use.result();
  const resetQuiz = useQuizStore.use.resetQuiz();

  const handleNextPress = () => {
    resetQuiz();
    navigation.replace('Options');
  };

  return {
    result,
    handleNextPress,
  };
}
