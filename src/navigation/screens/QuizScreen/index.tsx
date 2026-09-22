import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container } from '../../../components/basic/Container';
import { Dialog } from '../../../components/basic/Dialog';
import { ColorScheme, ThemeColors } from '../../../constants/colors';
import { LAYOUT } from '../../../constants/layout';
import { STRINGS } from '../../../constants/strings';
import { displayText } from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';
import { AnswerRow } from './AnswerRow';
import { PreviousQuestionButton } from './PreviousQuestionButton';
import { QuizProgress } from './QuizProgress';
import { WaitingView } from './WaitingView';
import { useQuestionTransition } from './useQuestionTransition';
import { useQuiz } from './useQuiz';

export function QuizScreen() {
  const styles = useThemedStyles(createStyles);
  const {
    options,
    question,
    questionIndex,
    questionsCount,
    selectedAnswer,
    isWaitingForResult,
    canGoBack,
    hasError,
    handleAnswerPress,
    handleBackPress,
    handleCancelPress,
    handleRetryPress,
    handleBackToOptionsPress,
  } = useQuiz();
  const transition = useQuestionTransition(handleAnswerPress, handleBackPress);
  const shownAnswer = transition.pendingAnswer ?? selectedAnswer;

  return (
    <Container>
      {question ? (
        <>
          <ScrollView
            ref={transition.scrollRef}
            contentContainerStyle={styles.content}
          >
            <QuizProgress index={questionIndex} count={questionsCount} />
            <Animated.View style={transition.contentStyle}>
              <View style={styles.questionCard}>
                <Text style={styles.questionText}>{question.question}</Text>
              </View>
              <View style={styles.answers}>
                {question.options.map((option, index) => (
                  <AnswerRow
                    key={`${questionIndex}-${index}`}
                    text={option}
                    index={index}
                    isSelected={shownAnswer === index}
                    onPress={transition.handleAnswerPress}
                  />
                ))}
              </View>
            </Animated.View>
          </ScrollView>
          <PreviousQuestionButton
            isVisible={canGoBack}
            onPress={transition.handleBackPress}
          />
        </>
      ) : (
        <WaitingView
          options={options}
          message={
            isWaitingForResult
              ? STRINGS.WAITING_RESULT
              : STRINGS.WAITING_QUESTIONS(options.length)
          }
          onCancelPress={handleCancelPress}
        />
      )}
      <Dialog
        visible={hasError}
        errorLabel={STRINGS.SERVICE_ERROR_LABEL}
        title={STRINGS.SERVICE_ERROR_ALERT_TITLE}
        message={STRINGS.SERVICE_ERROR_ALERT_MESSAGE}
        confirmTitle={STRINGS.TRY_AGAIN_BUTTON_TITLE}
        cancelTitle={STRINGS.BACK_TO_OPTIONS_BUTTON_TITLE}
        onConfirm={handleRetryPress}
        onCancel={handleBackToOptionsPress}
      />
    </Container>
  );
}

function createStyles(colors: ThemeColors, scheme: ColorScheme) {
  const isDark = scheme === 'dark';

  const styles = StyleSheet.create({
    content: {
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
      paddingBottom: 16,
    },
    questionCard: {
      padding: 22,
      marginBottom: isDark ? 20 : 18,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      boxShadow: `0 10px 26px ${colors.cardShadow}`,
    },
    questionText: {
      ...displayText(isDark ? 31 : 30, 1.1),
      color: colors.ink,
    },
    answers: {
      gap: isDark ? 12 : 10,
    },
  });

  return styles;
}
