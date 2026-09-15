import { FlatList, StyleSheet, Text } from 'react-native';
import { Container } from '../../../components/basic/Container';
import { COLORS } from '../../../constants/colors';
import { STRINGS } from '../../../constants/strings';
import { HistoryItem } from './HistoryItem';
import { useHistory } from './useHistory';

export function HistoryScreen() {
  const { entries, handleEntryPress, handleEntryLongPress } = useHistory();

  return (
    <Container>
      <Text style={styles.text}>{STRINGS.HISTORY_SCREEN_TITLE}</Text>
      <FlatList
        style={styles.list}
        data={entries}
        keyExtractor={entry => entry.id}
        renderItem={({ item }) => (
          <HistoryItem
            entry={item}
            onPress={handleEntryPress}
            onLongPress={handleEntryLongPress}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{STRINGS.HISTORY_EMPTY}</Text>
        }
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  list: { width: '100%' },
  text: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: COLORS.WHITE_COFFEE,
    fontSize: 18,
    textAlign: 'center',
  },
});
