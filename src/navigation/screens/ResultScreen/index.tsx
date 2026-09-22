import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container } from '../../../components/basic/Container';
import { BasicButton } from '../../../components/basic/BasicButton';
import { ThemeColors } from '../../../constants/colors';
import { LAYOUT } from '../../../constants/layout';
import { STRINGS } from '../../../constants/strings';
import {
  displayText,
  FONTS,
  monoText,
  sectionLabelText,
  uiText,
} from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';
import { useResult } from './useResult';

export function ResultScreen() {
  const styles = useThemedStyles(createStyles);
  const {
    result,
    questionsCount,
    handleNewDecisionPress,
    handleOpenInHistoryPress,
  } = useResult();

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.progress}>
            {STRINGS.RESULT_PROGRESS(questionsCount)}
          </Text>
          <View style={styles.savedPill}>
            <View style={styles.savedCheck}>
              <Text style={styles.savedCheckText}>✓</Text>
            </View>
            <Text style={styles.savedText}>{STRINGS.RESULT_SAVED}</Text>
          </View>
        </View>
        <Text style={styles.eyebrow}>{STRINGS.RESULT_EYEBROW}</Text>
        <Text style={styles.verdict}>{result?.winner}</Text>
        <View style={styles.divider} />
        <Text style={styles.explanation}>{result?.explanation}</Text>
      </ScrollView>
      <View style={styles.footer}>
        <BasicButton
          title={STRINGS.NEW_DECISION_BUTTON_TITLE}
          onPress={handleNewDecisionPress}
        />
        <BasicButton
          variant="outline"
          title={STRINGS.OPEN_IN_HISTORY_BUTTON_TITLE}
          onPress={handleOpenInHistoryPress}
        />
      </View>
    </Container>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    content: {
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
      paddingBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 26,
    },
    progress: {
      ...monoText(12, 0.5),
      color: colors.label,
    },
    savedPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingVertical: 6,
      paddingHorizontal: 11,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    savedCheck: {
      width: 14,
      height: 14,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    savedCheckText: {
      ...uiText(FONTS.BOLD, 9),
      color: colors.accentOn,
    },
    savedText: {
      ...uiText(FONTS.SEMI_BOLD, 12),
      color: colors.accentLine,
    },
    eyebrow: {
      ...sectionLabelText(1.6),
      color: colors.label,
      marginBottom: 14,
    },
    verdict: {
      ...displayText(46, 1.02),
      color: colors.ink,
      marginBottom: 22,
    },
    divider: {
      height: 1,
      marginBottom: 22,
      backgroundColor: colors.divider,
    },
    explanation: {
      ...uiText(FONTS.REGULAR, 17, 1.65),
      color: colors.body,
    },
    footer: {
      gap: 10,
      paddingTop: 8,
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
      paddingBottom: LAYOUT.FOOTER_BOTTOM,
    },
  });

  return styles;
}
