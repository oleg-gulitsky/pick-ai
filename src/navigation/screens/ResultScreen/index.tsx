import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Container } from '../../../components/basic/Container';
import { BasicButton } from '../../../components/basic/BasicButton';
import { STRINGS } from '../../../constants/strings';
import { COLORS } from '../../../constants/colors';
import { useResult } from './useResult';

export function ResultScreen() {
  const { result, handleNextPress } = useResult();

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
});
