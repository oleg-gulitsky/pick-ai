import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ScrollView } from 'react-native';
import { useReduceMotion } from '../../../hooks/useReduceMotion';

export function useQuestionTransition(
  onAnswer: (index: number) => void,
  onBack: () => void,
) {
  const isReduceMotionEnabled = useReduceMotion();
  const [offset] = useState(() => new Animated.Value(0));
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const isRunningRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      offset.stopAnimation();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    },
    [offset],
  );

  const run = useCallback(
    (direction: Direction, swap: () => void, delay = 0) => {
      isRunningRef.current = true;

      Animated.timing(offset, {
        toValue: -direction,
        delay,
        duration: LEAVE_DURATION,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) return;

        offset.setValue(direction);
        swap();
        scrollRef.current?.scrollTo({ y: 0, animated: false });
        frameRef.current = requestAnimationFrame(() =>
          Animated.timing(offset, {
            toValue: 0,
            duration: ENTER_DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start(() => {
            isRunningRef.current = false;
          }),
        );
      });
    },
    [offset],
  );

  const handleAnswerPress = useCallback(
    (index: number) => {
      if (isRunningRef.current) return;

      setPendingAnswer(index);
      run(
        1,
        () => {
          setPendingAnswer(null);
          onAnswer(index);
        },
        SELECTION_HOLD,
      );
    },
    [onAnswer, run],
  );

  const handleBackPress = useCallback(() => {
    if (isRunningRef.current) return;

    run(-1, onBack);
  }, [onBack, run]);

  const contentStyle = useMemo(() => {
    const distance = isReduceMotionEnabled ? 0 : SLIDE_DISTANCE;

    return {
      opacity: offset.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 1, 0],
      }),
      transform: [
        {
          translateY: offset.interpolate({
            inputRange: [-1, 1],
            outputRange: [-distance, distance],
          }),
        },
      ],
    };
  }, [isReduceMotionEnabled, offset]);

  return {
    scrollRef,
    contentStyle,
    pendingAnswer,
    handleAnswerPress,
    handleBackPress,
  };
}

type Direction = 1 | -1;

const SELECTION_HOLD = 220;
const LEAVE_DURATION = 160;
const ENTER_DURATION = 240;
const SLIDE_DISTANCE = 16;
