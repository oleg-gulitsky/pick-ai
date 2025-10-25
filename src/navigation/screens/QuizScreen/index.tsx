import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container } from '../../../components/basic/Container';
import { BasicButton } from '../../../components/basic/BasicButton';
import { COLORS } from '../../../constants/colors';
import { useQuiz } from './useQuiz';

export function QuizScreen() {
  const { handleOptionPress, question } = useQuiz();

  return (
    <Container>
      {question ? (
        <>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.text}>{question.question}</Text>
          </ScrollView>
          <View style={styles.bottomSection}>
            {question.options.map((option, value) => (
              <BasicButton
                style={styles.optionButton}
                key={value}
                title={option}
                onPress={() => handleOptionPress(value)}
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
