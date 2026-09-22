import { memo, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { ColorScheme, ThemeColors } from '../../../constants/colors';
import { FONTS, monoText, uiText } from '../../../constants/typography';
import { useAppTheme, useThemedStyles } from '../../../hooks/useAppTheme';

interface AnswerRowProps {
  text: string;
  index: number;
  isSelected: boolean;
  onPress: (index: number) => void;
}

export const AnswerRow = memo(AnswerRowComponent);

function AnswerRowComponent({
  text,
  index,
  isSelected,
  onPress,
}: AnswerRowProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [selection] = useState(() => new Animated.Value(isSelected ? 1 : 0));

  useEffect(() => {
    Animated.timing(selection, {
      toValue: isSelected ? 1 : 0,
      duration: SELECTION_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [isSelected, selection]);

  const animatedStyles = useMemo(() => {
    const fade = (idle: string, selected: string) =>
      selection.interpolate({
        inputRange: [0, 1],
        outputRange: [idle, selected],
      });
    const flip = (idle: string, selected: string) =>
      selection.interpolate({
        inputRange: [0, 0.45, 0.55, 1],
        outputRange: [idle, idle, selected, selected],
      });

    return {
      shadow: { opacity: selection },
      surface: {
        borderColor: fade(colors.border, colors.accent),
        backgroundColor: fade(colors.surface, colors.accent),
      },
      index: { backgroundColor: fade(colors.indexBg, colors.selectedIndexBg) },
      indexText: { color: flip(colors.mutedAlt, colors.selectedText) },
      text: { color: flip(colors.ink, colors.selectedText) },
    };
  }, [colors, selection]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={styles.row}
      onPress={() => onPress(index)}
    >
      <Animated.View style={[styles.shadow, animatedStyles.shadow]} />
      <Animated.View style={[styles.surface, animatedStyles.surface]}>
        <Animated.View style={[styles.index, animatedStyles.index]}>
          <Animated.Text style={[styles.indexText, animatedStyles.indexText]}>
            {index + 1}
          </Animated.Text>
        </Animated.View>
        <Animated.Text
          style={[
            styles.text,
            isSelected && styles.textSelected,
            animatedStyles.text,
          ]}
          numberOfLines={2}
        >
          {text}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const SELECTION_DURATION = 180;

function createStyles(colors: ThemeColors, scheme: ColorScheme) {
  const isDark = scheme === 'dark';
  const indexSize = isDark ? 28 : 26;
  const radius = isDark ? 20 : 18;

  const styles = StyleSheet.create({
    row: {
      height: isDark ? 90 : 78,
    },
    shadow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radius,
      boxShadow: `0 8px 20px ${colors.selectedShadow}`,
    },
    surface: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: isDark ? 14 : 12,
      paddingHorizontal: isDark ? 20 : 16,
      borderRadius: radius,
      borderWidth: 1,
    },
    index: {
      width: indexSize,
      height: indexSize,
      borderRadius: indexSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    indexText: {
      ...monoText(11),
    },
    text: {
      ...uiText(FONTS.REGULAR, isDark ? 17.5 : 16, 1.35),
      flex: 1,
    },
    textSelected: {
      fontFamily: FONTS.BOLD,
    },
  });

  return styles;
}
