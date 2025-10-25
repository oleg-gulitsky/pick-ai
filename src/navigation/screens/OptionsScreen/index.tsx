import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { STRINGS } from '../../../constants/strings';
import { Container } from '../../../components/basic/Container';
import { BasicButton } from '../../../components/basic/BasicButton';
import { usePendingStore } from '../../../store/usePendingStore';
import { OptionInput } from './OptionInput';
import { useOptionsForm } from './useOptionsForm';

export function OptionsScreen() {
  const isPending = usePendingStore.use.isPending();
  const {
    firstOption,
    secondOption,
    isValid,
    handleFirstOptionChange,
    handleSecondOptionChange,
    handleSubmit,
  } = useOptionsForm();

  return (
    <Container>
      <Text style={styles.text}>{STRINGS.OPTIONS_SCREEN_HINT}</Text>
      <OptionInput
        value={firstOption}
        placeholder="Option 1"
        autoFocus={true}
        onChangeText={handleFirstOptionChange}
      />
      <OptionInput
        value={secondOption}
        placeholder="Option 2"
        onChangeText={handleSecondOptionChange}
      />
      <View style={styles.bottomSection}>
        <BasicButton
          disabled={!isValid || isPending}
          onPress={handleSubmit}
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
});
