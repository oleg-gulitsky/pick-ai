import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../../constants/colors';
import { STRINGS } from '../../../constants/strings';
import { FONTS, monoText, uiText } from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';

interface AddOptionRowProps {
  onPress: () => void;
}

export const AddOptionRow = memo(AddOptionRowComponent);

function AddOptionRowComponent({ onPress }: AddOptionRowProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable accessibilityRole="button" style={styles.row} onPress={onPress}>
      <View style={styles.index}>
        <Text style={styles.plus}>+</Text>
      </View>
      <Text style={styles.text}>{STRINGS.ADD_OPTION}</Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      minHeight: 66,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 18,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: colors.borderDashed,
      backgroundColor: colors.surfaceDashed,
    },
    index: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.indexBg,
    },
    plus: {
      ...monoText(13),
      color: colors.muted,
    },
    text: {
      ...uiText(FONTS.REGULAR, 17, 1.3),
      color: colors.muted,
    },
  });

  return styles;
}
