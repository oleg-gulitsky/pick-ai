import { StyleSheet } from 'react-native';
import {
  createStaticNavigation,
  StaticParamList,
  useNavigation,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { STRINGS } from '../constants/strings';
import { OptionsScreen } from './screens/OptionsScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ResultScreen } from './screens/ResultScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HistoryDetailsScreen } from './screens/HistoryDetailsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.LICORICE,
    borderTopColor: COLORS.DARK_LAVA,
  },
  tabBarItem: {
    borderRadius: 10,
    margin: 6,
    overflow: 'hidden',
  },
  tabBarIcon: {
    display: 'none',
  },
  tabBarLabel: {
    fontSize: 16,
    marginStart: 0,
    marginEnd: 0,
  },
});

const stackScreenOptions = {
  headerShown: false,
  animation: 'fade',
} as const;

const NewDecisionStack = createNativeStackNavigator({
  initialRouteName: 'Options',
  screenOptions: stackScreenOptions,
  screens: {
    Options: OptionsScreen,
    Quiz: QuizScreen,
    Result: ResultScreen,
  },
});

const HistoryStack = createNativeStackNavigator({
  initialRouteName: 'History',
  screenOptions: stackScreenOptions,
  screens: {
    History: HistoryScreen,
    HistoryDetails: HistoryDetailsScreen,
  },
});

const RootTabs = createBottomTabNavigator({
  initialRouteName: 'NewDecisionTab',
  screenOptions: {
    headerShown: false,
    animation: 'fade',
    tabBarHideOnKeyboard: true,
    tabBarIcon: () => null,
    tabBarLabelPosition: 'beside-icon',
    tabBarStyle: styles.tabBar,
    tabBarItemStyle: styles.tabBarItem,
    tabBarIconStyle: styles.tabBarIcon,
    tabBarLabelStyle: styles.tabBarLabel,
    tabBarActiveBackgroundColor: COLORS.DARK_LAVA,
    tabBarActiveTintColor: COLORS.DUTCH_WHITE,
    tabBarInactiveTintColor: COLORS.WHITE_COFFEE,
  },
  screens: {
    NewDecisionTab: {
      screen: NewDecisionStack,
      options: { title: STRINGS.NEW_DECISION_TAB_TITLE },
    },
    HistoryTab: {
      screen: HistoryStack,
      options: { title: STRINGS.HISTORY_TAB_TITLE },
    },
    SettingsTab: {
      screen: SettingsScreen,
      options: { title: STRINGS.SETTINGS_TAB_TITLE },
    },
  },
});

type RootTabsParamList = StaticParamList<typeof RootTabs>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabsParamList {}
  }
}

const Navigation = createStaticNavigation(RootTabs);

export default Navigation;

type AppParamList = RootTabsParamList &
  StaticParamList<typeof NewDecisionStack> &
  StaticParamList<typeof HistoryStack>;

export type ScreenName = {
  [K in keyof AppParamList]: undefined extends AppParamList[K] ? K : never;
}[keyof AppParamList];

export function useAppNavigation() {
  return useNavigation<NativeStackNavigationProp<AppParamList>>();
}
