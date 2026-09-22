import { memo, ReactNode } from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { ColorScheme, ThemeColors } from '../../constants/colors';
import { FONTS, uiText } from '../../constants/typography';
import { useThemedStyles } from '../../hooks/useAppTheme';

export type ButtonVariant =
  | 'primary'
  | 'outline'
  | 'destructive'
  | 'destructiveOutline';

interface BasicButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  accessory?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const BasicButton = memo(BasicButtonComponent);

export function BasicButtonComponent({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  accessory,
  style,
  textStyle,
}: BasicButtonProps) {
  const styles = useThemedStyles(createStyles);
  const variantStyles = {
    primary: { button: styles.primary, title: styles.primaryTitle },
    outline: { button: styles.outline, title: styles.outlineTitle },
    destructive: { button: styles.destructive, title: styles.destructiveTitle },
    destructiveOutline: {
      button: styles.destructiveOutline,
      title: styles.destructiveOutlineTitle,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        variantStyles.button,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text
        style={[
          styles.title,
          variantStyles.title,
          disabled && styles.disabledTitle,
          textStyle,
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
      {accessory ? <View>{accessory}</View> : null}
    </Pressable>
  );
}

function createStyles(colors: ThemeColors, scheme: ColorScheme) {
  const styles = StyleSheet.create({
    button: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      borderRadius: 999,
      paddingHorizontal: 16,
    },
    primary: {
      height: 58,
      backgroundColor: colors.accent,
    },
    outline: {
      height: 52,
      borderWidth: 1,
      borderColor: colors.borderDashed,
    },
    destructive: {
      height: 54,
      backgroundColor: colors.destructive,
    },
    destructiveOutline: {
      height: 56,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.destructiveBorder,
    },
    disabled: {
      backgroundColor: colors.surfaceMuted,
    },
    pressed: {
      opacity: 0.85,
    },
    title: {
      textAlign: 'center',
    },
    primaryTitle: {
      ...uiText(scheme === 'dark' ? FONTS.BOLD : FONTS.SEMI_BOLD, 17),
      color: colors.accentOn,
    },
    outlineTitle: {
      ...uiText(FONTS.SEMI_BOLD, 16),
      color: colors.outlineText,
    },
    destructiveTitle: {
      ...uiText(FONTS.BOLD, 16.5),
      color: colors.destructiveOn,
    },
    destructiveOutlineTitle: {
      ...uiText(FONTS.SEMI_BOLD, 16),
      color: colors.destructive,
    },
    disabledTitle: {
      color: colors.muted,
    },
  });

  return styles;
}
