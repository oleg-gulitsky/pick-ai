import { StyleSheet, Text } from 'react-native';
import { Container } from '../../../components/basic/Container';
import { BasicButton } from '../../../components/basic/BasicButton';
import { COLORS } from '../../../constants/colors';
import { STRINGS } from '../../../constants/strings';
import { useSettings } from './useSettings';

export function SettingsScreen() {
  const { historySize, canClearHistory, handleClearHistoryPress } =
    useSettings();

  return (
    <Container>
      <Text style={styles.text}>{STRINGS.SETTINGS_SCREEN_TITLE}</Text>
      <Text style={styles.label}>
        {STRINGS.SAVED_DECISIONS_LABEL}
        {historySize}
      </Text>
      <BasicButton
        style={canClearHistory ? undefined : styles.disabledButton}
        disabled={!canClearHistory}
        title={STRINGS.CLEAR_HISTORY_BUTTON_TITLE}
        onPress={handleClearHistoryPress}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  text: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    color: COLORS.WHITE_COFFEE,
    fontSize: 18,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
