import { Alert } from "react-native";
import { ScreenName, useAppNavigation } from "../navigation";
import { STRINGS } from "../constants/strings";

export function useHandleServiceError() {
  const navigation = useAppNavigation();

  return function handleServiceError(fallbackScreen: ScreenName) {
    Alert.alert(STRINGS.SERVICE_ERROR_ALERT_TITLE, STRINGS.SERVICE_ERROR_ALERT_MESSAGE);
    fallbackScreen && navigation.replace(fallbackScreen);
  }
}