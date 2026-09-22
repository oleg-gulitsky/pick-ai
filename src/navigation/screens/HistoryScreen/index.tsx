import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Container } from '../../../components/basic/Container';
import { Dialog } from '../../../components/basic/Dialog';
import { ThemeColors } from '../../../constants/colors';
import { LAYOUT } from '../../../constants/layout';
import { STRINGS } from '../../../constants/strings';
import { displayText, monoText } from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';
import { EmptyHistory } from './EmptyHistory';
import { HistoryItem } from './HistoryItem';
import { useHistory } from './useHistory';

export function HistoryScreen() {
  const styles = useThemedStyles(createStyles);
  const {
    entries,
    isDeleteDialogVisible,
    handleEntryPress,
    handleEntryLongPress,
    handleStartDecisionPress,
    handleDeleteConfirm,
    handleDeleteCancel,
  } = useHistory();

  return (
    <Container>
      <FlatList
        contentContainerStyle={styles.content}
        data={entries}
        keyExtractor={entry => entry.id}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{STRINGS.HISTORY_SCREEN_TITLE}</Text>
            <Text style={styles.count}>
              {entries.length > 0
                ? STRINGS.HISTORY_SAVED_COUNT(entries.length)
                : STRINGS.HISTORY_NOTHING_SAVED}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <HistoryItem
            entry={item}
            onPress={handleEntryPress}
            onLongPress={handleEntryLongPress}
          />
        )}
        ListEmptyComponent={
          <EmptyHistory onStartPress={handleStartDecisionPress} />
        }
      />
      <Dialog
        visible={isDeleteDialogVisible}
        isDestructive={true}
        title={STRINGS.DELETE_ENTRY_ALERT_TITLE}
        message={STRINGS.DELETE_ENTRY_ALERT_MESSAGE}
        confirmTitle={STRINGS.DELETE_ENTRY_ALERT_CONFIRM}
        cancelTitle={STRINGS.ALERT_CANCEL_BUTTON_TITLE}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Container>
  );
}

function Separator() {
  return <View style={SEPARATOR_STYLE} />;
}

const SEPARATOR_STYLE = { height: 12 };

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    content: {
      flexGrow: 1,
      paddingHorizontal: LAYOUT.SCREEN_SIDE,
      paddingBottom: LAYOUT.FOOTER_BOTTOM,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      ...displayText(34, 1.05),
      color: colors.ink,
      marginBottom: 6,
    },
    count: {
      ...monoText(12),
      color: colors.label,
    },
  });

  return styles;
}
