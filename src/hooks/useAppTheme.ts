import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS, ColorScheme, ThemeColors } from '../constants/colors';
import { useSettingsStore } from '../store/useSettingsStore';

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore.use.theme();

  const scheme: ColorScheme =
    preference === 'system'
      ? systemScheme === 'dark'
        ? 'dark'
        : 'light'
      : preference;

  return { scheme, colors: COLORS[scheme] };
}

export function useThemedStyles<T>(
  createStyles: (colors: ThemeColors, scheme: ColorScheme) => T,
): T {
  const { scheme, colors } = useAppTheme();

  return useMemo(
    () => createStyles(colors, scheme),
    [colors, createStyles, scheme],
  );
}
