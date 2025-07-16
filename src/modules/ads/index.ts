import {
  Appodeal,
  AppodealAdType,
  AppodealBannerEvent,
  AppodealInterstitialEvent,
  AppodealRewardedEvent,
  AppodealSdkEvent,
} from 'react-native-appodeal';

const isShowEventDevLogs = false;

const appodealAppKey = '56020f47ab9ab1331588b2daaab8144c77511c39c95bbf69';

type EventHandler = (params?: any) => void;

export function initAds() {
  if (__DEV__ && isShowEventDevLogs) {
    addEventDevLogs();
  }

  const adTypes =
    AppodealAdType.INTERSTITIAL |
    AppodealAdType.REWARDED_VIDEO |
    AppodealAdType.BANNER;

  Appodeal.cache(AppodealAdType.INTERSTITIAL);
  Appodeal.cache(AppodealAdType.REWARDED_VIDEO);

  Appodeal.setBannerAnimation(true);

  Appodeal.initialize(appodealAppKey, adTypes);

  Appodeal.show(AppodealAdType.BANNER_BOTTOM);
}

export function tryShowInterstitial(cb?: EventHandler) {
  if (Appodeal.canShow(AppodealAdType.INTERSTITIAL)) {
    const handler = () => {
      cb && cb();
      Appodeal.removeEventListener(AppodealInterstitialEvent.CLOSED, handler);
    };
    Appodeal.addEventListener(AppodealInterstitialEvent.CLOSED, handler);
    Appodeal.show(AppodealAdType.INTERSTITIAL);
  } else {
    cb && cb();
  }
}

export function tryShowRewarded(cb?: EventHandler) {
  if (Appodeal.canShow(AppodealAdType.REWARDED_VIDEO)) {
    const handler = (event: any) => {
      if (event.isFinished) {
        cb && cb();
      }
      Appodeal.removeEventListener(AppodealRewardedEvent.CLOSED, handler);
    };
    Appodeal.addEventListener(AppodealRewardedEvent.CLOSED, handler);
    Appodeal.show(AppodealAdType.REWARDED_VIDEO);
  } else {
    cb && cb();
  }
}

function addEventHandlers(eventMap: Record<string, (event?: any) => void>) {
  Object.entries(eventMap).forEach(([event, handler]) =>
    Appodeal.addEventListener(event, handler),
  );
}

function addEventDevLogs() {
  addEventHandlers(eventDevLogs);
}

const eventDevLogs = {
  //SDK
  [AppodealSdkEvent.INITIALIZED]: () =>
    console.log('Appodeal SDK did initialize'),

  //Banner
  [AppodealBannerEvent.LOADED]: (event: any) =>
    console.log(
      'Banner loaded. Height: ',
      event.height + ', precache: ' + event.isPrecache,
    ),
  [AppodealBannerEvent.SHOWN]: () => console.log('Banner shown'),
  [AppodealBannerEvent.EXPIRED]: () => console.log('Banner expired'),
  [AppodealBannerEvent.CLICKED]: () => console.log('Banner was clicked'),
  [AppodealBannerEvent.FAILED_TO_LOAD]: () =>
    console.log('Banner failed to load'),

  //Interstitial
  [AppodealInterstitialEvent.LOADED]: (event: any) =>
    console.log('Interstitial loaded. Precache: ', event.isPrecache),
  [AppodealInterstitialEvent.SHOWN]: () => console.log('Interstitial shown'),
  [AppodealInterstitialEvent.EXPIRED]: () =>
    console.log('Interstitial expired'),
  [AppodealInterstitialEvent.CLICKED]: () =>
    console.log('Interstitial was clicked'),
  [AppodealInterstitialEvent.CLOSED]: () => console.log('Interstitial closed'),
  [AppodealInterstitialEvent.FAILED_TO_LOAD]: () =>
    console.log('Interstitial failed to load'),
  [AppodealInterstitialEvent.FAILED_TO_SHOW]: () =>
    console.log('Interstitial failed to show'),

  //Rewarded
  [AppodealRewardedEvent.LOADED]: (event: any) =>
    console.log('Rewarded video loaded. Precache: ', event.isPrecache),
  [AppodealRewardedEvent.SHOWN]: () => console.log('Rewarded video shown'),
  [AppodealRewardedEvent.EXPIRED]: () => console.log('Rewarded video expired'),
  [AppodealRewardedEvent.CLICKED]: () =>
    console.log('Rewarded video was clicked'),
  [AppodealRewardedEvent.REWARD]: (event: any) =>
    console.log(
      'Rewarded video finished. Amount: ',
      event.amount + ', currency: ' + event.currency,
    ),
  [AppodealRewardedEvent.CLOSED]: (event: any) =>
    console.log('Rewarded video closed, is finished: ', event.isFinished),
  [AppodealRewardedEvent.FAILED_TO_LOAD]: () =>
    console.log('Rewarded video failed to load'),
  [AppodealRewardedEvent.FAILED_TO_SHOW]: () =>
    console.log('Rewarded video failed to show'),
};
