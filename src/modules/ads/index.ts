import Appodeal, {
  AppodealAdType,
  AppodealBannerEvents,
  AppodealInterstitialEvents,
  AppodealRewardedEvents,
  AppodealSdkEvents,
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
      Appodeal.removeEventListener(AppodealInterstitialEvents.CLOSED, handler);
    };
    Appodeal.addEventListener(AppodealInterstitialEvents.CLOSED, handler);
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
      Appodeal.removeEventListener(AppodealRewardedEvents.CLOSED, handler);
    };
    Appodeal.addEventListener(AppodealRewardedEvents.CLOSED, handler);
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
  [AppodealSdkEvents.INITIALIZED]: () =>
    console.log('Appodeal SDK did initialize'),

  //Banner
  [AppodealBannerEvents.LOADED]: (event: any) =>
    console.log(
      'Banner loaded. Height: ',
      event.height + ', precache: ' + event.isPrecache,
    ),
  [AppodealBannerEvents.SHOWN]: () => console.log('Banner shown'),
  [AppodealBannerEvents.EXPIRED]: () => console.log('Banner expired'),
  [AppodealBannerEvents.CLICKED]: () => console.log('Banner was clicked'),
  [AppodealBannerEvents.FAILED_TO_LOAD]: () =>
    console.log('Banner failed to load'),

  //Interstitial
  [AppodealInterstitialEvents.LOADED]: (event: any) =>
    console.log('Interstitial loaded. Precache: ', event.isPrecache),
  [AppodealInterstitialEvents.SHOWN]: () => console.log('Interstitial shown'),
  [AppodealInterstitialEvents.EXPIRED]: () =>
    console.log('Interstitial expired'),
  [AppodealInterstitialEvents.CLICKED]: () =>
    console.log('Interstitial was clicked'),
  [AppodealInterstitialEvents.CLOSED]: () => console.log('Interstitial closed'),
  [AppodealInterstitialEvents.FAILED_TO_LOAD]: () =>
    console.log('Interstitial failed to load'),
  [AppodealInterstitialEvents.FAILED_TO_SHOW]: () =>
    console.log('Interstitial failed to show'),

  //Rewarded
  [AppodealRewardedEvents.LOADED]: (event: any) =>
    console.log('Rewarded video loaded. Precache: ', event.isPrecache),
  [AppodealRewardedEvents.SHOWN]: () => console.log('Rewarded video shown'),
  [AppodealRewardedEvents.EXPIRED]: () => console.log('Rewarded video expired'),
  [AppodealRewardedEvents.CLICKED]: () =>
    console.log('Rewarded video was clicked'),
  [AppodealRewardedEvents.REWARD]: (event: any) =>
    console.log(
      'Rewarded video finished. Amount: ',
      event.amount + ', currency: ' + event.currency,
    ),
  [AppodealRewardedEvents.CLOSED]: (event: any) =>
    console.log('Rewarded video closed, is finished: ', event.isFinished),
  [AppodealRewardedEvents.FAILED_TO_LOAD]: () =>
    console.log('Rewarded video failed to load'),
  [AppodealRewardedEvents.FAILED_TO_SHOW]: () =>
    console.log('Rewarded video failed to show'),
};
