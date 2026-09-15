import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StaticScreenProps } from '@react-navigation/native';
import { Container } from '../../../components/basic/Container';
import { BasicButton } from '../../../components/basic/BasicButton';
import { COLORS } from '../../../constants/colors';
import { STRINGS } from '../../../constants/strings';
import { useHistoryDetails } from './useHistoryDetails';

type HistoryDetailsScreenProps = StaticScreenProps<{ id: string }>;

export function HistoryDetailsScreen({ route }: HistoryDetailsScreenProps) {
  const { entry, answeredQuestions, handleBackPress, handleDeletePress } =
    useHistoryDetails(route.params.id);

  return (
    <Container>
      {entry ? (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>
            {entry.firstOption} vs {entry.secondOption}
          </Text>
          <Text style={styles.date}>
            {new Date(entry.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.sectionTitle}>
            {STRINGS.HISTORY_RECOMMENDATION_TITLE}
          </Text>
          <Text style={styles.result}>{entry.result}</Text>
          <Text style={styles.sectionTitle}>
            {STRINGS.HISTORY_ANSWERS_TITLE}
          </Text>
          {answeredQuestions.map(({ question, options }, questionIndex) => (
            <View key={questionIndex} style={styles.answerBlock}>
              <Text style={styles.question}>{question}</Text>
              {options.map(({ text, isChosen }, optionIndex) => (
                <Text
                  key={optionIndex}
                  style={[styles.option, isChosen && styles.chosenOption]}
                >
                  {text}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.bottomSection}>
        <BasicButton
          style={styles.bottomButton}
          title={STRINGS.BACK_BUTTON_TITLE}
          onPress={handleBackPress}
        />
        {entry ? (
          <BasicButton
            style={styles.bottomButton}
            title={STRINGS.DELETE_BUTTON_TITLE}
            onPress={handleDeletePress}
          />
        ) : null}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: { width: '100%', marginBottom: 140 },
  bottomSection: {
    width: '100%',
    position: 'absolute',
    bottom: 70,
    flexDirection: 'row',
    gap: 20,
  },
  bottomButton: {
    flex: 1,
    width: 'auto',
  },
  title: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 26,
    textAlign: 'center',
  },
  date: {
    color: COLORS.WHITE_COFFEE,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  sectionTitle: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 22,
    marginTop: 30,
    marginBottom: 10,
  },
  result: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 18,
    textAlign: 'justify',
  },
  answerBlock: {
    marginBottom: 20,
  },
  question: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 18,
  },
  option: {
    color: COLORS.WHITE_COFFEE,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.WHITE_COFFEE,
    borderRadius: 10,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
    opacity: 0.6,
  },
  chosenOption: {
    color: COLORS.DUTCH_WHITE,
    backgroundColor: COLORS.DARK_LAVA,
    borderColor: COLORS.DARK_LAVA,
    fontWeight: 'bold',
    opacity: 1,
  },
});
