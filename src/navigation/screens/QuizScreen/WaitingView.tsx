import { memo, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { ThemeColors } from '../../../constants/colors';
import { LAYOUT } from '../../../constants/layout';
import { STRINGS } from '../../../constants/strings';
import {
  displayText,
  FONTS,
  monoText,
  uiText,
} from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';
import { useLoopAnimation } from '../../../hooks/useLoopAnimation';

interface WaitingViewProps {
  options: string[];
  message: string;
  onCancelPress: () => void;
}

export const WaitingView = memo(WaitingViewComponent);

function WaitingViewComponent({
  options,
  message,
  onCancelPress,
}: WaitingViewProps) {
  const styles = useThemedStyles(createStyles);
  const isPair = options.length <= 2;
  const duration = isPair ? PAIR_DURATION : GROUP_DURATION;
  const guideInset = isPair ? 14 : 12;
  const isFocused = useIsFocused();
  const travel = useLoopAnimation(duration, isFocused);
  const [guideHeight, setGuideHeight] = useState(0);

  const handleNamesLayout = (event: LayoutChangeEvent) =>
    setGuideHeight(event.nativeEvent.layout.height - guideInset * 2);

  const dotTranslateY = travel.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(guideHeight, 0)],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{STRINGS.WAITING_EYEBROW}</Text>
      <View style={styles.center}>
        <View
          style={[styles.names, isPair ? styles.namesPair : styles.namesGroup]}
          onLayout={handleNamesLayout}
        >
          {options.map((option, index) => (
            <WeighingName
              key={index}
              text={option}
              style={isPair ? styles.namePair : styles.nameGroup}
              duration={duration}
              delay={isPair ? 0 : index * GROUP_STAGGER}
              isInverted={isPair && index === 1}
              isActive={isFocused}
            />
          ))}
          <View
            style={[styles.guide, { top: guideInset, bottom: guideInset }]}
          />
          <Animated.View
            style={[
              styles.dot,
              { top: guideInset, transform: [{ translateY: dotTranslateY }] },
            ]}
          />
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.message}>{message}</Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          style={styles.cancel}
          onPress={onCancelPress}
        >
          <Text style={styles.cancelText}>{STRINGS.CANCEL_BUTTON_TITLE}</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface WeighingNameProps {
  text: string;
  style: TextStyle;
  duration: number;
  delay: number;
  isInverted: boolean;
  isActive: boolean;
}

const PAIR_DURATION = 3200;
const GROUP_DURATION = 5200;
const GROUP_STAGGER = 1300;
const MIN_OPACITY = 0.58;

function WeighingName({
  text,
  style,
  duration,
  delay,
  isInverted,
  isActive,
}: WeighingNameProps) {
  const progress = useLoopAnimation(duration, isActive, delay);
  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: isInverted ? [MIN_OPACITY, 1] : [1, MIN_OPACITY],
  });

  return <Animated.Text style={[style, { opacity }]}>{text}</Animated.Text>;
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
    },
    eyebrow: {
      ...monoText(12, 0.5),
      color: colors.muted,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      paddingBottom: 60,
    },
    names: {
      width: '100%',
    },
    namesPair: {
      gap: 56,
    },
    namesGroup: {
      gap: 34,
    },
    namePair: {
      ...displayText(34, 1.04),
      color: colors.ink,
    },
    nameGroup: {
      ...displayText(29, 1.04),
      color: colors.ink,
    },
    guide: {
      position: 'absolute',
      left: -14,
      width: 2,
      backgroundColor: colors.border,
    },
    dot: {
      position: 'absolute',
      left: -19,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.accent,
    },
    footer: {
      position: 'absolute',
      left: LAYOUT.SCREEN_SIDE,
      right: LAYOUT.SCREEN_SIDE,
      bottom: 22,
    },
    message: {
      ...uiText(FONTS.REGULAR, 17, 1.5),
      color: colors.body,
    },
    cancel: {
      alignSelf: 'flex-start',
      marginTop: 14,
    },
    cancelText: {
      ...uiText(FONTS.SEMI_BOLD, 14),
      color: colors.muted,
    },
  });

  return styles;
}
