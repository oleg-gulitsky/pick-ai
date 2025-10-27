import { useEffect } from 'react';
import Config from 'react-native-config';
import { initAds } from './modules/ads';
import { initRemoteConfig } from './modules/remoteConfig';

import Navigation from './navigation';

export default function App() {
  useEffect(() => {
    initAds({
      appodealAppKey: Config.APPODEAL_APP_KEY,
    });
    initRemoteConfig();
  }, []);

  return <Navigation />;
}
