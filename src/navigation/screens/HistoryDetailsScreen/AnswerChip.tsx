import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../../constants/colors';
import { FONTS, uiText } from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';

interface AnswerChipProps {
  text: string;
  isChosen: boolean;
}

export const AnswerChip = memo(AnswerChipComponent);

function AnswerChipComponent({ text, isChosen }: AnswerChipProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.chip, isChosen && styles.chipChosen]}>
      <View style={[styles.mark, isChosen && styles.markChosen]}>
        {isChosen ? <Text style={styles.check}>✓</Text> : null}
      </View>
      <Text style={[styles.text, isChosen && styles.textChosen]}>{text}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipChosen: {
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    mark: {
      width: 18,
      height: 18,
      marginTop: 1.5,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.borderDashed,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markChosen: {
      borderWidth: 0,
      backgroundColor: colors.selectedIndexBg,
    },
    check: {
      ...uiText(FONTS.BOLD, 10),
      color: colors.selectedText,
    },
    text: {
      ...uiText(FONTS.REGULAR, 14.5, 1.4),
      flex: 1,
      color: colors.mutedAlt,
    },
    textChosen: {
      fontFamily: FONTS.BOLD,
      color: colors.selectedText,
    },
  });

  return styles;
}
