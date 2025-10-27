import { useAppInit } from './hooks/useAppInit';
import Navigation from './navigation';

export default function App() {
  useAppInit();

  return <Navigation />;
}
