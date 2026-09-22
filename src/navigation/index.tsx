import { Keyboard } from 'react-native';
import {
  createStaticNavigation,
  DarkTheme,
  DefaultTheme,
  StaticParamList,
  Theme,
  useNavigation,
} from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { COLORS, ColorScheme } from '../constants/colors';
import { STRINGS } from '../constants/strings';
import { OptionsScreen } from './screens/OptionsScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ResultScreen } from './screens/ResultScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HistoryDetailsScreen } from './screens/HistoryDetailsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { TabBar } from '../components/TabBar';

export function getNavigationTheme(scheme: ColorScheme): Theme {
  return NAVIGATION_THEMES[scheme];
}

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

const RootTabs = createMaterialTopTabNavigator({
  initialRouteName: 'NewDecisionTab',
  tabBarPosition: 'bottom',
  tabBar: props => <TabBar {...props} />,
  keyboardDismissMode: 'none',
  screenListeners: {
    blur: () => Keyboard.dismiss(),
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

const NAVIGATION_THEMES: Record<ColorScheme, Theme> = {
  light: createNavigationTheme(DefaultTheme, 'light'),
  dark: createNavigationTheme(DarkTheme, 'dark'),
};

function createNavigationTheme(base: Theme, scheme: ColorScheme): Theme {
  const colors = COLORS[scheme];

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.bg,
      card: colors.bg,
      text: colors.ink,
      border: colors.border,
      notification: colors.destructive,
    },
  };
}
