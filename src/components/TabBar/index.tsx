import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppodealBanner } from 'react-native-appodeal';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { COLORS } from '../../constants/colors';
import { useAppConfigStore } from '../../store/useAppConfigStore';
import { TabBarItem, TabRoute } from './TabBarItem';

export function TabBar({
  state,
  descriptors,
  navigation,
  position,
}: MaterialTopTabBarProps) {
  const isAdsEnabled = useAppConfigStore.use.isAdsEnabled();

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
      <View style={styles.tabBar}>
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
      {isAdsEnabled && <AppodealBanner style={styles.banner} />}
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 49,
    backgroundColor: COLORS.LICORICE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.DARK_LAVA,
  },
  banner: {
    backgroundColor: COLORS.LICORICE,
  },
});
