import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { useReduceMotion } from './useReduceMotion';

export function useLoopAnimation(
  duration: number,
  isActive: boolean,
  delay = 0,
): Animated.Value {
  const isReduceMotionEnabled = useReduceMotion();
  const [value] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!isActive || isReduceMotionEnabled) {
      value.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: EASE_IN_OUT_THERE_AND_BACK,
        useNativeDriver: true,
      }),
    );
    const timeoutId = setTimeout(() => animation.start(), delay);

    return () => {
      clearTimeout(timeoutId);
      animation.stop();
    };
  }, [delay, duration, isActive, isReduceMotionEnabled, value]);

  return value;
}

const EASE_IN_OUT = Easing.bezier(0.42, 0, 0.58, 1);

function EASE_IN_OUT_THERE_AND_BACK(t: number): number {
  return EASE_IN_OUT(t < 0.5 ? t * 2 : 2 - t * 2);
}
