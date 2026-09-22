import { Animated, StyleProp, TextStyle } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useLoopAnimation } from '../../../hooks/useLoopAnimation';

interface NudgeArrowProps {
  style: StyleProp<TextStyle>;
  isEnabled: boolean;
}

export function NudgeArrow({ style, isEnabled }: NudgeArrowProps) {
  const isFocused = useIsFocused();
  const progress = useLoopAnimation(NUDGE_DURATION, isEnabled && isFocused);
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  return (
    <Animated.Text style={[style, { transform: [{ translateX }] }]}>
      →
    </Animated.Text>
  );
}

const NUDGE_DURATION = 1600;
