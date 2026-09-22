import { memo } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { BasicButton } from '../../../components/basic/BasicButton';
import { ThemeColors } from '../../../constants/colors';
import { STRINGS } from '../../../constants/strings';
import { displayText, FONTS, uiText } from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';
import { useLoopAnimation } from '../../../hooks/useLoopAnimation';

interface EmptyHistoryProps {
  onStartPress: () => void;
}

export const EmptyHistory = memo(EmptyHistoryComponent);

function EmptyHistoryComponent({ onStartPress }: EmptyHistoryProps) {
  const styles = useThemedStyles(createStyles);
  const isFocused = useIsFocused();

  return (
    <View style={styles.container}>
      <View style={styles.tiles}>
        {TILE_DELAYS.map(delay => (
          <FloatingTile
            key={delay}
            delay={delay}
            isActive={isFocused}
            style={styles.tile}
          />
        ))}
      </View>
      <Text style={styles.title}>{STRINGS.HISTORY_EMPTY_TITLE}</Text>
      <Text style={styles.message}>{STRINGS.HISTORY_EMPTY_MESSAGE}</Text>
      <BasicButton
        style={styles.button}
        textStyle={styles.buttonTitle}
        title={STRINGS.START_DECISION_BUTTON_TITLE}
        onPress={onStartPress}
      />
    </View>
  );
}

interface FloatingTileProps {
  delay: number;
  isActive: boolean;
  style: StyleProp<ViewStyle>;
}

const TILE_DELAYS = [0, 600, 1200];
const FLOAT_DURATION = 4000;

function FloatingTile({ delay, isActive, style }: FloatingTileProps) {
  const progress = useLoopAnimation(FLOAT_DURATION, isActive, delay);
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  return <Animated.View style={[style, { transform: [{ translateY }] }]} />;
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 70,
    },
    tiles: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 26,
    },
    tile: {
      width: 54,
      height: 70,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.borderDashed,
      backgroundColor: colors.surfaceDashed,
    },
    title: {
      ...displayText(27, 1.1),
      color: colors.ink,
      marginBottom: 10,
      textAlign: 'center',
    },
    message: {
      ...uiText(FONTS.REGULAR, 14, 1.55),
      maxWidth: 252,
      color: colors.bodyMuted,
      textAlign: 'center',
    },
    button: {
      width: 'auto',
      height: 52,
      marginTop: 26,
      paddingHorizontal: 26,
      backgroundColor: colors.ink,
    },
    buttonTitle: {
      fontFamily: FONTS.BOLD,
      fontSize: 16,
    },
  });

  return styles;
}
