import { memo } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useTheme } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

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
  const { fonts } = useTheme();

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
      <Text
        style={[fonts.medium, styles.label, isFocused && styles.labelFocused]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    margin: 6,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.DARK_LAVA,
  },
  label: {
    fontSize: 16,
    color: COLORS.WHITE_COFFEE,
  },
  labelFocused: {
    color: COLORS.DUTCH_WHITE,
  },
});
