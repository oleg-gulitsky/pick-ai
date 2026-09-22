import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

export function useKeyboardVisible(): boolean {
  const [isVisible, setIsVisible] = useState(() => Keyboard.isVisible());

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () =>
      setIsVisible(true),
    );
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () =>
      setIsVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isVisible;
}
