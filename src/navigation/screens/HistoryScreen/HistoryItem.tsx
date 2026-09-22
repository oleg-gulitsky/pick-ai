import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../../constants/colors';
import { STRINGS } from '../../../constants/strings';
import { FONTS, monoText, uiText } from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';
import { HistoryEntry } from '../../../store/useHistoryStore';
import { formatDay } from '../../../tools/formatDate';

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
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      accessibilityRole="button"
      style={styles.card}
      onPress={() => onPress(entry.id)}
      onLongPress={() => onLongPress(entry.id)}
    >
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {STRINGS.HISTORY_OPTIONS_COUNT(entry.options.length)}
        </Text>
        <Text style={styles.metaText}>{formatDay(entry.createdAt)}</Text>
      </View>
      <View style={styles.winnerRow}>
        {entry.winner ? (
          <View style={styles.check}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        ) : null}
        <Text style={styles.winner} numberOfLines={1}>
          {entry.winner || entry.options.join(STRINGS.OPTIONS_SEPARATOR)}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
      <Text style={styles.options} numberOfLines={1}>
        {entry.options.join(' · ')}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    card: {
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 10,
    },
    metaText: {
      ...monoText(10.5),
      color: colors.label,
    },
    winnerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      marginBottom: 8,
    },
    check: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    checkText: {
      ...uiText(FONTS.BOLD, 10),
      color: colors.accentOn,
    },
    winner: {
      ...uiText(FONTS.BOLD, 16.5),
      flex: 1,
      color: colors.ink,
    },
    chevron: {
      ...uiText(FONTS.REGULAR, 16),
      color: colors.label,
    },
    options: {
      ...uiText(FONTS.REGULAR, 13, 1.35),
      color: colors.mutedAlt,
    },
  });

  return styles;
}
