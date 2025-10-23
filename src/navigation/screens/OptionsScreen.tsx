import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';
import { Container } from '../../components/basic/Container';
import { BasicButton } from '../../components/basic/BasicButton';
import { tryShowInterstitial } from '../../modules/ads';
import { getQuestionsFromOpenRouter } from '../../services/openRouterAI';
import { useQuizStore } from '../../store/useQuizStore';
import { usePendingStore } from '../../store/usePendingStore';

export function OptionsScreen() {
  const { navigate } = useNavigation();
  const setIsPendingFalse = usePendingStore.use.setIsPendingFalse();
  const setIsPendingTrue = usePendingStore.use.setIsPendingTrue();
  const setQuestions = useQuizStore.use.setQuestions();
  const setOptions = useQuizStore.use.setOptions();

  const [firstOption, handleFirstOptionChange] = useState('');
  const [secondOption, handleSecondOptionChange] = useState('');

  const handleGetQuestionsPress = () => {
    tryShowInterstitial();
    setOptions(firstOption, secondOption);
    setIsPendingTrue();
    navigate('Quiz');
    getQuestionsFromOpenRouter(firstOption, secondOption)
      .then(res => {
        if (res) {
          setQuestions(res);
        } else {
          navigate('Options');
        }
      })
      .catch(() => navigate('Options'))
      .finally(() => setIsPendingFalse());
  };

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
        onChangeText={handleFirstOptionChange}
      />
      <TextInput
        style={styles.input}
        value={secondOption}
        placeholder="Option 2"
        placeholderTextColor={COLORS.DUTCH_WHITE}
        cursorColor={COLORS.DUTCH_WHITE}
        onChangeText={handleSecondOptionChange}
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
});
