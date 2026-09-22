import { ScrollView, StyleSheet, Text } from 'react-native';
import { version } from '../../../../package.json';
import { Container } from '../../../components/basic/Container';
import { BasicButton } from '../../../components/basic/BasicButton';
import { Dialog } from '../../../components/basic/Dialog';
import { ThemeColors } from '../../../constants/colors';
import { LAYOUT } from '../../../constants/layout';
import { STRINGS } from '../../../constants/strings';
import {
  displayText,
  monoText,
  sectionLabelText,
} from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';
import {
  ANSWER_RANGE_BOUNDS,
  QUESTION_RANGE_BOUNDS,
} from '../../../store/useSettingsStore';
import { RangeSetting } from './RangeSetting';
import { ThemeSwitch } from './ThemeSwitch';
import { useSettings } from './useSettings';

export function SettingsScreen() {
  const styles = useThemedStyles(createStyles);
  const {
    historySize,
    canClearHistory,
    theme,
    questionRange,
    answerRange,
    isClearDialogVisible,
    handleThemeChange,
    handleQuestionRangeChange,
    handleAnswerRangeChange,
    handleClearHistoryPress,
    handleClearHistoryConfirm,
    handleClearHistoryCancel,
  } = useSettings();

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{STRINGS.SETTINGS_SCREEN_TITLE}</Text>

        <Text style={styles.sectionLabel}>{STRINGS.SETTINGS_QUIZ_SECTION}</Text>
        <RangeSetting
          label={STRINGS.SETTINGS_QUESTIONS_RANGE}
          bounds={QUESTION_RANGE_BOUNDS}
          value={questionRange}
          onChange={handleQuestionRangeChange}
        />
        <RangeSetting
          label={STRINGS.SETTINGS_ANSWERS_RANGE}
          bounds={ANSWER_RANGE_BOUNDS}
          value={answerRange}
          onChange={handleAnswerRangeChange}
        />

        <Text style={[styles.sectionLabel, styles.sectionGap]}>
          {STRINGS.SETTINGS_APPEARANCE_SECTION}
        </Text>
        <ThemeSwitch value={theme} onChange={handleThemeChange} />

        <Text style={[styles.sectionLabel, styles.sectionGap]}>
          {STRINGS.SETTINGS_DATA_SECTION}
        </Text>
        <BasicButton
          variant="destructiveOutline"
          disabled={!canClearHistory}
          title={STRINGS.CLEAR_HISTORY_BUTTON_TITLE(historySize)}
          onPress={handleClearHistoryPress}
        />

        <Text style={styles.version}>{STRINGS.APP_VERSION(version)}</Text>
      </ScrollView>
      <Dialog
        visible={isClearDialogVisible}
        isDestructive={true}
        title={STRINGS.CLEAR_HISTORY_ALERT_TITLE}
        message={STRINGS.CLEAR_HISTORY_ALERT_MESSAGE}
        confirmTitle={STRINGS.CLEAR_HISTORY_ALERT_CONFIRM}
        cancelTitle={STRINGS.ALERT_CANCEL_BUTTON_TITLE}
        onConfirm={handleClearHistoryConfirm}
        onCancel={handleClearHistoryCancel}
      />
    </Container>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    content: {
      flexGrow: 1,
      gap: 10,
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
    },
    title: {
      ...displayText(34, 1.05),
      color: colors.ink,
      marginBottom: 12,
    },
    sectionLabel: {
      ...sectionLabelText(),
      color: colors.label,
    },
    sectionGap: {
      marginTop: 14,
    },
    version: {
      ...monoText(11),
      marginTop: 'auto',
      paddingTop: 14,
      paddingBottom: LAYOUT.FOOTER_BOTTOM,
      color: colors.faint,
    },
  });

  return styles;
}
