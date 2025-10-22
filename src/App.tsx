import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TextInput } from 'react-native';
import {
  getQuestionsFromOpenRouter,
  getResultFromOpenRouter,
} from './services/openRouterAI';
import { COLORS } from './constants/colors';
import { Container } from './components/basic/Container';
import { BasicButton } from './components/basic/BasicButton';
import { STRINGS } from './constants/strings';
import { initAds, tryShowInterstitial } from './modules/ads';
import { initRemoteConfig } from './modules/remoteConfig';
import { usePendingStore } from './store/usePendingStore';
import { useQuizStore } from './store/useQuizStore';

export function App() {
  const setIsPendingFalse = usePendingStore.use.setIsPendingFalse();
  const setIsPendingTrue = usePendingStore.use.setIsPendingTrue();

  const questions = useQuizStore.use.questions();
  const setQuestions = useQuizStore.use.setQuestions();
  const answers = useQuizStore.use.answers();
  const addAnswer = useQuizStore.use.addAnswer();
  const questionIndex = useQuizStore.use.currentQuestionIndex();
  const setQuestionIndex = useQuizStore.use.setCurrentQuestionIndex();
  const result = useQuizStore.use.result();
  const setResult = useQuizStore.use.setResult();
  const resetQuiz = useQuizStore.use.resetQuiz();

  const [firstOption, setFirstOption] = useState('');
  const [secondOption, setSecondOption] = useState('');

  useEffect(() => {
    initAds();
    initRemoteConfig();
  }, []);

  const handleGetQuestionsPress = () => {
    tryShowInterstitial();
    setIsPendingTrue();
    getQuestionsFromOpenRouter(firstOption, secondOption)
      .then(res => {
        res && setQuestions(res);
      })
      .finally(() => setIsPendingFalse());
  };

  const handleOptionPress = (index: number, value: number) => {
    addAnswer(index, value);
    if (index + 1 >= questions.length) {
      tryShowInterstitial();
      setIsPendingTrue();
      getResultFromOpenRouter([firstOption, secondOption], questions, answers)
        .then(res => setResult(res))
        .finally(() => setIsPendingFalse());
      return;
    }

    setQuestionIndex(questionIndex + 1);
  };

  const handleNextPress = () => {
    setFirstOption('');
    setSecondOption('');
    resetQuiz();
  };

  if (result) {
    return (
      <Container>
        <ScrollView style={styles.scrollView}>
          <Text style={[styles.text, styles.resultText]}>{result}</Text>
        </ScrollView>
        <View style={styles.bottomSection}>
          <BasicButton
            title={STRINGS.TRY_AGAIN_BUTTON_TITLE}
            onPress={handleNextPress}
          />
        </View>
      </Container>
    );
  }

  if (questions.length) {
    const { question, options } = questions[questionIndex];
    return (
      <Container>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.text}>{question}</Text>
        </ScrollView>
        <View style={styles.bottomSection}>
          {options.map((option, value) => (
            <BasicButton
              style={styles.optionButton}
              key={value}
              title={option}
              onPress={() => handleOptionPress(questionIndex, value)}
            />
          ))}
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <Text style={styles.text}>{STRINGS.OPTIONS_SCREEN_HINT}</Text>
      <TextInput
        style={styles.input}
        value={firstOption}
        placeholder="Option 1"
        placeholderTextColor={COLORS.DUTCH_WHITE}
        cursorColor={COLORS.DUTCH_WHITE}
        autoFocus={true}
        onChangeText={setFirstOption}
      />
      <TextInput
        style={styles.input}
        value={secondOption}
        placeholder="Option 2"
        placeholderTextColor={COLORS.DUTCH_WHITE}
        cursorColor={COLORS.DUTCH_WHITE}
        onChangeText={setSecondOption}
      />
      <View style={styles.bottomSection}>
        <BasicButton
          disabled={!firstOption || !secondOption}
          onPress={handleGetQuestionsPress}
          title={STRINGS.GENERATE_QUESTIONS_BUTTON_TITLE}
        />
      </View>
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
  text: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 20,
  },
  resultText: {
    fontSize: 20,
    textAlign: 'justify',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.WHITE_COFFEE,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: COLORS.DUTCH_WHITE,
    fontSize: 18,
  },
  optionButton: {
    marginTop: 20,
  },
});

export default App;
