import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../../../constants/colors';
import { HistoryEntry } from '../../../store/useHistoryStore';

interface HistoryItemProps {
  entry: HistoryEntry;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
}

export const HistoryItem = memo(HistoryItemComponent);

function HistoryItemComponent({
  entry,
  onPress,
  onLongPress,
}: HistoryItemProps) {
  return (
    <Pressable
      style={styles.item}
      onPress={() => onPress(entry.id)}
      onLongPress={() => onLongPress(entry.id)}
    >
      <Text style={styles.options}>
        {entry.firstOption} vs {entry.secondOption}
      </Text>
      <Text style={styles.date}>
        {new Date(entry.createdAt).toLocaleDateString()}
      </Text>
      <Text style={styles.result} numberOfLines={2}>
        {entry.result}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.WHITE_COFFEE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  options: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 18,
  },
  date: {
    color: COLORS.WHITE_COFFEE,
    fontSize: 14,
    marginTop: 5,
  },
  result: {
    color: COLORS.DUTCH_WHITE,
    fontSize: 16,
    marginTop: 10,
  },
});
