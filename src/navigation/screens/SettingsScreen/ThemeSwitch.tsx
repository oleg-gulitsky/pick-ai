import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors } from '../../../constants/colors';
import { STRINGS } from '../../../constants/strings';
import { FONTS, uiText } from '../../../constants/typography';
import { useThemedStyles } from '../../../hooks/useAppTheme';
import { ThemePreference } from '../../../store/useSettingsStore';

interface ThemeSwitchProps {
  value: ThemePreference;
  onChange: (value: ThemePreference) => void;
}

export const ThemeSwitch = memo(ThemeSwitchComponent);

function ThemeSwitchComponent({ value, onChange }: ThemeSwitchProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {THEME_OPTIONS.map(({ theme, title }) => {
        const isActive = theme === value;

        return (
          <Pressable
            key={theme}
            accessibilityRole="radio"
            accessibilityState={{ checked: isActive }}
            style={[styles.segment, isActive && styles.segmentActive]}
            onPress={() => onChange(theme)}
          >
            <Text style={[styles.title, isActive && styles.titleActive]}>
              {title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const THEME_OPTIONS: { theme: ThemePreference; title: string }[] = [
  { theme: 'system', title: STRINGS.THEME_SYSTEM },
  { theme: 'light', title: STRINGS.THEME_LIGHT },
  { theme: 'dark', title: STRINGS.THEME_DARK },
];

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: 6,
      padding: 5,
      borderRadius: 16,
      backgroundColor: colors.segmentedBg,
    },
    segment: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentActive: {
      backgroundColor: colors.segmentActive,
      boxShadow: `0 1px 3px ${colors.segmentShadow}`,
    },
    title: {
      ...uiText(FONTS.SEMI_BOLD, 14),
      color: colors.tabIdle,
    },
    titleActive: {
      fontFamily: FONTS.BOLD,
      color: colors.ink,
    },
  });

  return styles;
}
