import { useAppInit } from './hooks/useAppInit';
import Navigation, { navigationTheme } from './navigation';

export default function App() {
  useAppInit();

  return <Navigation theme={navigationTheme} />;
}
