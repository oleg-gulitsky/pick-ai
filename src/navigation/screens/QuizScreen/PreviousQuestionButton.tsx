import { memo, useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { ThemeColors } from '../../../constants/colors';
import { LAYOUT } from '../../../constants/layout';
import { STRINGS } from '../../../constants/strings';
import { FONTS, uiText } from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';

interface PreviousQuestionButtonProps {
  isVisible: boolean;
  onPress: () => void;
}

export const PreviousQuestionButton = memo(PreviousQuestionButtonComponent);

function PreviousQuestionButtonComponent({
  isVisible,
  onPress,
}: PreviousQuestionButtonProps) {
  const styles = useThemedStyles(createStyles);
  const [opacity] = useState(() => new Animated.Value(isVisible ? 1 : 0));

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: isVisible ? 1 : 0,
      duration: FADE_DURATION,
      useNativeDriver: true,
    }).start();
  }, [isVisible, opacity]);

  return (
    <Animated.View
      pointerEvents={isVisible ? 'auto' : 'none'}
      importantForAccessibility={isVisible ? 'auto' : 'no-hide-descendants'}
      style={[styles.footer, { opacity }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={STRINGS.PREVIOUS_QUESTION_LABEL}
        style={styles.backButton}
        onPress={onPress}
      >
        <Text style={styles.backArrow}>←</Text>
      </Pressable>
      <Text style={styles.hint}>{STRINGS.PREVIOUS_QUESTION_HINT}</Text>
    </Animated.View>
  );
}

const FADE_DURATION = 240;

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
      paddingBottom: LAYOUT.FOOTER_BOTTOM,
    },
    backButton: {
      width: 56,
      height: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderDashed,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backArrow: {
      ...uiText(FONTS.REGULAR, 17),
      color: colors.icon,
    },
    hint: {
      ...uiText(FONTS.REGULAR, 13),
      flex: 1,
      color: colors.muted,
    },
  });

  return styles;
}
