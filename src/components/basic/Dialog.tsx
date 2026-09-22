import { useEffect, useState } from 'react';
import { Animated, BackHandler, StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../constants/colors';
import {
  displayText,
  FONTS,
  monoText,
  uiText,
} from '../../constants/typography';
import { useThemedStyles } from '../../hooks/useAppTheme';
import { BasicButton } from './BasicButton';

interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmTitle: string;
  cancelTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  errorLabel?: string;
}

export function Dialog({ visible, ...props }: DialogProps) {
  return visible ? <DialogCard {...props} /> : null;
}

function DialogCard({
  title,
  message,
  confirmTitle,
  cancelTitle,
  onConfirm,
  onCancel,
  isDestructive = false,
  errorLabel,
}: Omit<DialogProps, 'visible'>) {
  const styles = useThemedStyles(createStyles);
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onCancel();
        return true;
      },
    );

    return () => subscription.remove();
  }, [onCancel]);

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      accessibilityViewIsModal={true}
    >
      <View style={styles.card}>
        {errorLabel ? (
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>!</Text>
            </View>
            <Text style={styles.badgeLabel}>{errorLabel}</Text>
          </View>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <BasicButton
            variant={isDestructive ? 'destructive' : 'primary'}
            style={styles.confirmButton}
            textStyle={styles.confirmTitle}
            title={confirmTitle}
            onPress={onConfirm}
          />
          <BasicButton
            variant="outline"
            style={styles.cancelButton}
            title={cancelTitle}
            onPress={onCancel}
          />
        </View>
      </View>
    </Animated.View>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      paddingHorizontal: 20,
      backgroundColor: colors.overlay,
    },
    card: {
      paddingTop: 26,
      paddingHorizontal: 22,
      paddingBottom: 22,
      borderRadius: 26,
      borderWidth: 1,
      borderColor: colors.modalBorder,
      backgroundColor: colors.surface,
      boxShadow: `0 24px 50px ${colors.modalShadow}`,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      marginBottom: 14,
    },
    badge: {
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.destructiveBorder,
    },
    badgeText: {
      ...uiText(FONTS.BOLD, 14),
      color: colors.destructiveBadgeText,
    },
    badgeLabel: {
      ...monoText(11, 1.2),
      color: colors.destructive,
    },
    title: {
      ...displayText(28, 1.1),
      color: colors.ink,
      marginBottom: 10,
    },
    message: {
      ...uiText(FONTS.REGULAR, 15.5, 1.55),
      color: colors.bodyMuted,
      marginBottom: 22,
    },
    actions: {
      gap: 10,
    },
    confirmButton: {
      height: 54,
    },
    confirmTitle: {
      fontFamily: FONTS.BOLD,
      fontSize: 16.5,
    },
    cancelButton: {
      height: 50,
    },
  });

  return styles;
}
