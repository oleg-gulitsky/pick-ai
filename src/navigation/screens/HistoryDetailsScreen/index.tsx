import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StaticScreenProps } from '@react-navigation/native';
import { Container } from '../../../components/basic/Container';
import { Dialog } from '../../../components/basic/Dialog';
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
import { formatDateTime } from '../../../tools/formatDate';
import { AnswerChip } from './AnswerChip';
import { useHistoryDetails } from './useHistoryDetails';

type HistoryDetailsScreenProps = StaticScreenProps<{ id: string }>;

export function HistoryDetailsScreen({ route }: HistoryDetailsScreenProps) {
  const styles = useThemedStyles(createStyles);
  const {
    entry,
    answeredQuestions,
    isDeleteDialogVisible,
    handleBackPress,
    handleDeletePress,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useHistoryDetails(route.params.id);

  return (
    <Container>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={STRINGS.BACK_BUTTON_LABEL}
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        {entry ? (
          <>
            <Text style={styles.timestamp}>
              {formatDateTime(entry.createdAt)}
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.deleteButton}
              onPress={handleDeletePress}
            >
              <Text style={styles.deleteText}>
                {STRINGS.DELETE_BUTTON_TITLE}
              </Text>
            </Pressable>
          </>
        ) : null}
      </View>
      {entry ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>
            {entry.options.map((option, index) => (
              <Text key={index}>
                {index > 0 ? (
                  <Text style={styles.titleSeparator}>
                    {STRINGS.OPTIONS_SEPARATOR}
                  </Text>
                ) : null}
                {option}
              </Text>
            ))}
          </Text>
          <View style={styles.resultCard}>
            <Text style={styles.sectionLabel}>
              {STRINGS.HISTORY_RECOMMENDATION_TITLE}
            </Text>
            {entry.winner ? (
              <Text style={styles.verdict}>{entry.winner}</Text>
            ) : null}
            <Text style={styles.explanation}>{entry.explanation}</Text>
          </View>
          <Text style={[styles.sectionLabel, styles.answersLabel]}>
            {STRINGS.HISTORY_ANSWERS_TITLE}
          </Text>
          <View style={styles.questions}>
            {answeredQuestions.map(({ question, options }, questionIndex) => (
              <View key={questionIndex}>
                <Text style={styles.question}>{question}</Text>
                <View style={styles.chips}>
                  {options.map(({ text, isChosen }, optionIndex) => (
                    <AnswerChip
                      key={optionIndex}
                      text={text}
                      isChosen={isChosen}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
      <Dialog
        visible={isDeleteDialogVisible}
        isDestructive={true}
        title={STRINGS.DELETE_ENTRY_ALERT_TITLE}
        message={STRINGS.DELETE_ENTRY_ALERT_MESSAGE}
        confirmTitle={STRINGS.DELETE_ENTRY_ALERT_CONFIRM}
        cancelTitle={STRINGS.ALERT_CANCEL_BUTTON_TITLE}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Container>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
      marginBottom: 16,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderDashed,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backArrow: {
      ...uiText(FONTS.REGULAR, 16),
      color: colors.icon,
    },
    timestamp: {
      ...monoText(11),
      color: colors.mutedAlt,
    },
    deleteButton: {
      height: 40,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.destructiveBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deleteText: {
      ...uiText(FONTS.SEMI_BOLD, 13.5),
      color: colors.destructive,
    },
    content: {
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
      paddingBottom: LAYOUT.FOOTER_BOTTOM,
    },
    title: {
      ...displayText(26, 1.14),
      color: colors.ink,
      marginBottom: 16,
    },
    titleSeparator: {
      color: colors.mutedAlt,
    },
    resultCard: {
      padding: 18,
      marginBottom: 22,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    sectionLabel: {
      ...sectionLabelText(),
      color: colors.label,
      marginBottom: 10,
    },
    verdict: {
      ...displayText(28, 1.08),
      color: colors.ink,
      marginBottom: 12,
    },
    explanation: {
      ...uiText(FONTS.REGULAR, 15.5, 1.6),
      color: colors.body,
    },
    answersLabel: {
      marginBottom: 12,
    },
    questions: {
      gap: 18,
    },
    question: {
      ...uiText(FONTS.REGULAR, 15, 1.4),
      color: colors.body,
      marginBottom: 9,
    },
    chips: {
      gap: 7,
    },
  });

  return styles;
}
