import { useEffect } from 'react';
import { Appearance, StatusBar } from 'react-native';
import { useAppInit } from './hooks/useAppInit';
import { useAppTheme } from './hooks/useAppTheme';
import { useQuizRestore } from './hooks/useQuizRestore';
import { useSettingsStore } from './store/useSettingsStore';
import Navigation, { getNavigationTheme } from './navigation';

export default function App() {
  useAppInit();
  const { isRestored, initialState } = useQuizRestore();
  const { scheme, colors } = useAppTheme();
  const themePreference = useSettingsStore.use.theme();

  useEffect(() => {
    Appearance.setColorScheme(
      themePreference === 'system' ? null : themePreference,
    );
  }, [themePreference]);

  return (
    <>
      <StatusBar
        backgroundColor={colors.bg}
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      {isRestored ? (
        <Navigation
          theme={getNavigationTheme(scheme)}
          initialState={initialState}
        />
      ) : null}
    </>
  );
}
