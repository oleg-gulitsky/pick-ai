import { memo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeColors } from '../../../constants/colors';
import { STRINGS } from '../../../constants/strings';
import { FONTS, monoText, uiText } from '../../../constants/typography';
import { useAppTheme, useThemedStyles } from '../../../hooks/useAppTheme';

interface OptionInputProps {
  index: number;
  value: string;
  autoFocus: boolean;
  onChangeText: (index: number, text: string) => void;
  onRemove?: (index: number) => void;
}

export const OptionInput = memo(OptionInputComponent);

function OptionInputComponent({
  index,
  value,
  autoFocus,
  onChangeText,
  onRemove,
}: OptionInputProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      style={[styles.row, isFocused && styles.rowFocused]}
      onPress={() => inputRef.current?.focus()}
    >
      <View style={styles.index}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        placeholder={STRINGS.OPTION_PLACEHOLDER(index)}
        placeholderTextColor={colors.muted}
        cursorColor={colors.accentLine}
        selectionColor={colors.accentRing}
        autoFocus={autoFocus}
        multiline={true}
        submitBehavior="blurAndSubmit"
        returnKeyType="done"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChangeText={text => onChangeText(index, text)}
      />
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={STRINGS.REMOVE_OPTION_LABEL(index)}
          hitSlop={11}
          style={styles.remove}
          onPress={() => onRemove(index)}
        >
          <Text style={styles.removeText}>×</Text>
        </Pressable>
      ) : null}
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
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    rowFocused: {
      borderColor: colors.accentLine,
      boxShadow: `0 0 0 4px ${colors.accentRing}`,
    },
    index: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    indexText: {
      ...monoText(11),
      color: colors.accentOn,
    },
    input: {
      ...uiText(FONTS.REGULAR, 17, 1.3),
      flex: 1,
      padding: 0,
      color: colors.ink,
      textAlignVertical: 'center',
    },
    remove: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.indexBg,
    },
    removeText: {
      ...monoText(13),
      color: colors.muted,
    },
  });

  return styles;
}
