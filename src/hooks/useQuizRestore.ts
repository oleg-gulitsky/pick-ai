import { useEffect, useState } from 'react';
import { InitialState } from '@react-navigation/native';
import { useQuizStore } from '../store/useQuizStore';
import { ScreenName } from '../navigation';

export function useQuizRestore(): QuizRestore {
  const [restore, setRestore] = useState<QuizRestore>({ isRestored: false });

  useEffect(() => {
    let isMounted = true;

    Promise.resolve(useQuizStore.persist.rehydrate()).finally(() => {
      if (isMounted) {
        setRestore({ isRestored: true, initialState: getInitialState() });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return restore;
}

type QuizRestore = {
  isRestored: boolean;
  initialState?: InitialState;
};

function getInitialState(): InitialState | undefined {
  const { questions, result } = useQuizStore.getState();
  const screen: ScreenName | null = result
    ? 'Result'
    : questions.length > 0
    ? 'Quiz'
    : null;

  return screen
    ? {
        routes: [
          { name: 'NewDecisionTab', state: { routes: [{ name: screen }] } },
        ],
      }
    : undefined;
}
