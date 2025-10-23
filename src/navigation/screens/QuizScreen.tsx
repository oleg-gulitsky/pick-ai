import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container } from '../../components/basic/Container';
import { BasicButton } from '../../components/basic/BasicButton';
import { COLORS } from '../../constants/colors';
import { useQuizStore } from '../../store/useQuizStore';
import { tryShowInterstitial } from '../../modules/ads';
import { usePendingStore } from '../../store/usePendingStore';
import { getResultFromOpenRouter } from '../../services/openRouterAI';
import { useNavigation } from '@react-navigation/native';

export function QuizScreen() {
  const { navigate } = useNavigation();
  const firstOption = useQuizStore.use.firstOption();
  const secondOption = useQuizStore.use.secondOption();
  const questions = useQuizStore.use.questions();
  const questionIndex = useQuizStore.use.currentQuestionIndex();
  const answers = useQuizStore.use.answers();
  const setCurrentQuestionIndex = useQuizStore.use.setCurrentQuestionIndex();
  const addAnswer = useQuizStore.use.addAnswer();
  const setIsPendingTrue = usePendingStore.use.setIsPendingTrue();
  const setIsPendingFalse = usePendingStore.use.setIsPendingFalse();
  const setResult = useQuizStore.use.setResult();

  const handleOptionPress = (index: number, value: number) => {
    addAnswer(index, value);
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      tryShowInterstitial();
      setIsPendingTrue();
      navigate('Result');
      getResultFromOpenRouter([firstOption, secondOption], questions, answers)
        .then(res => setResult(res))
        .finally(() => setIsPendingFalse());
      return;
    }
    setCurrentQuestionIndex(nextIndex);
  };

  return (
    <Container>
      {questions[questionIndex] ? (
        <>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.text}>{questions[questionIndex].question}</Text>
          </ScrollView>
          <View style={styles.bottomSection}>
            {questions[questionIndex].options.map((option, value) => (
              <BasicButton
                style={styles.optionButton}
                key={value}
                title={option}
                onPress={() => handleOptionPress(questionIndex, value)}
              />
            ))}
          </View>
        </>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollView: { width: '100%', marginBottom: 100 },
  bottomSection: {
    width: '100%',
    position: 'absolute',
    bottom: 70,
  },
  optionButton: {
    marginTop: 20,
  },
  text: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 20,
  },
});
