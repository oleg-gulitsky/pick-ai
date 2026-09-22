import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container } from '../../../components/basic/Container';
import { BasicButton } from '../../../components/basic/BasicButton';
import { ColorScheme, ThemeColors } from '../../../constants/colors';
import { LAYOUT } from '../../../constants/layout';
import { STRINGS } from '../../../constants/strings';
import {
  displayText,
  FONTS,
  monoText,
  uiText,
} from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';
import { AddOptionRow } from './AddOptionRow';
import { NudgeArrow } from './NudgeArrow';
import { OptionInput } from './OptionInput';
import { useOptionsForm } from './useOptionsForm';

export function OptionsScreen() {
  const styles = useThemedStyles(createStyles);
  const {
    options,
    autoFocusKey,
    canSubmit,
    canAddOption,
    handleOptionChange,
    handleAddOptionPress,
    handleRemoveOptionPress,
    handleSubmit,
  } = useOptionsForm();

  return (
    <Container>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>{STRINGS.OPTIONS_EYEBROW}</Text>
        <Text style={styles.title}>{STRINGS.OPTIONS_TITLE}</Text>
        <View style={styles.rows}>
          {options.map((option, index) => (
            <OptionInput
              key={option.key}
              index={index}
              value={option.text}
              autoFocus={option.key === autoFocusKey}
              onChangeText={handleOptionChange}
              onRemove={
                option.isRemovable ? handleRemoveOptionPress : undefined
              }
            />
          ))}
          {canAddOption ? (
            <AddOptionRow onPress={handleAddOptionPress} />
          ) : null}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <BasicButton
          disabled={!canSubmit}
          onPress={handleSubmit}
          title={STRINGS.GENERATE_QUESTIONS_BUTTON_TITLE}
          accessory={
            <NudgeArrow
              style={[styles.arrow, !canSubmit && styles.arrowDisabled]}
              isEnabled={canSubmit}
            />
          }
        />
      </View>
    </Container>
  );
}

function createStyles(colors: ThemeColors, scheme: ColorScheme) {
  const styles = StyleSheet.create({
    content: {
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
      paddingBottom: 16,
    },
    eyebrow: {
      ...monoText(12, 0.5),
      color: colors.label,
      marginBottom: 20,
    },
    title: {
      ...displayText(38, 1.06),
      color: colors.ink,
      marginBottom: 26,
    },
    rows: {
      gap: 12,
    },
    footer: {
      paddingTop: 8,
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
      paddingBottom: LAYOUT.FOOTER_BOTTOM,
    },
    arrow: {
      ...uiText(scheme === 'dark' ? FONTS.BOLD : FONTS.SEMI_BOLD, 17),
      color: colors.accentOn,
    },
    arrowDisabled: {
      color: colors.muted,
    },
  });

  return styles;
}
