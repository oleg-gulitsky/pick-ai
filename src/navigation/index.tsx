import {
  createStaticNavigation,
  StaticParamList,
  useNavigation,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { OptionsScreen } from './screens/OptionsScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ResultScreen } from './screens/ResultScreen';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Options',
  screenOptions: {
    headerShown: false,
    animation: 'fade',
  },
  screens: {
    Options: OptionsScreen,
    Quiz: QuizScreen,
    Result: ResultScreen,
  },
});

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

const Navigation = createStaticNavigation(RootStack);

export default Navigation;

export type ScreenName = keyof ReactNavigation.RootParamList;

export function useAppNavigation() {
  return useNavigation<
    NativeStackNavigationProp<ReactNavigation.RootParamList>
  >();
}
