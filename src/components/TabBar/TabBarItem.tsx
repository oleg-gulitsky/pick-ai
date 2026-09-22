import { memo } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { ThemeColors } from '../../constants/colors';
import { FONTS, uiText } from '../../constants/typography';
import { useThemedStyles } from '../../hooks/useAppTheme';

export type TabRoute = MaterialTopTabBarProps['state']['routes'][number];

interface TabBarItemProps {
  route: TabRoute;
  label: string;
  index: number;
  isFocused: boolean;
  position: MaterialTopTabBarProps['position'];
  onPress: (route: TabRoute) => void;
}

export const TabBarItem = memo(TabBarItemComponent);

function TabBarItemComponent({
  route,
  label,
  index,
  isFocused,
  position,
  onPress,
}: TabBarItemProps) {
  const styles = useThemedStyles(createStyles);

  const highlightOpacity = position.interpolate({
    inputRange: [index - 1, index, index + 1],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      onPress={() => onPress(route)}
      style={styles.item}
    >
      <Animated.View
        style={[styles.highlight, { opacity: highlightOpacity }]}
      />
      <Text style={[styles.label, isFocused && styles.labelFocused]}>
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    item: {
      flex: 1,
      height: 40,
      marginTop: 6,
      marginHorizontal: 6,
      borderRadius: 12,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
    },
    highlight: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.tabActive,
    },
    label: {
      ...uiText(FONTS.SEMI_BOLD, 14.5),
      color: colors.tabIdle,
    },
    labelFocused: {
      fontFamily: FONTS.BOLD,
      color: colors.tabActiveText,
    },
  });

  return styles;
}
