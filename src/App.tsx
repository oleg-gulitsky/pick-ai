import { useEffect } from 'react';
import { initAds } from './modules/ads';
import { initRemoteConfig } from './modules/remoteConfig';

import Navigation from './navigation';

export default function App() {
  useEffect(() => {
    initAds();
    initRemoteConfig();
  }, []);

  return <Navigation />;
}
