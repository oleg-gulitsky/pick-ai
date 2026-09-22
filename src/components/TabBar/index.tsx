import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppodealBanner } from 'react-native-appodeal';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { ThemeColors } from '../../constants/colors';
import { useThemedStyles } from '../../hooks/useAppTheme';
import { useAppConfigStore } from '../../store/useAppConfigStore';
import { TabBarItem, TabRoute } from './TabBarItem';
import { useKeyboardVisible } from './useKeyboardVisible';

export function TabBar({
  state,
  descriptors,
  navigation,
  position,
}: MaterialTopTabBarProps) {
  const styles = useThemedStyles(createStyles);
  const isAdsEnabled = useAppConfigStore.use.isAdsEnabled();
  const isKeyboardVisible = useKeyboardVisible();

  const focusedRouteKey = state.routes[state.index].key;

  const handleTabPress = useCallback(
    (route: TabRoute) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (route.key !== focusedRouteKey && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation, focusedRouteKey],
  );

  return (
    <>
      <View
        style={[
          styles.tabBar,
          !isAdsEnabled && !isKeyboardVisible && styles.tabBarNoBanner,
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          return (
            <TabBarItem
              key={route.key}
              route={route}
              label={options.title ?? route.name}
              index={index}
              isFocused={route.key === focusedRouteKey}
              position={position}
              onPress={handleTabPress}
            />
          );
        })}
      </View>
      {isAdsEnabled && (
        <View style={styles.bannerSlot}>
          <AppodealBanner style={styles.banner} />
        </View>
      )}
    </>
  );
}

function createStyles(colors: ThemeColors) {
  const styles = StyleSheet.create({
    tabBar: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      height: 52,
      backgroundColor: colors.tabBg,
      borderTopWidth: 1,
      borderTopColor: colors.tabBorder,
    },
    tabBarNoBanner: {
      height: 102,
      paddingTop: 8,
    },
    bannerSlot: {
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bannerBg,
    },
    banner: {
      width: 320,
      height: 50,
    },
  });

  return styles;
}
