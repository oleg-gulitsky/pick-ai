import Appodeal, {
  AppodealAdType,
  AppodealBannerEvents,
  AppodealInterstitialEvents,
  AppodealRewardedEvents,
  AppodealSdkEvents,
} from 'react-native-appodeal';

type initAdsParams = {
  appodealAppKey: string;
  isShowEventDevLogs?: boolean;
};

export function initAds({
  appodealAppKey,
  isShowEventDevLogs = false,
}: initAdsParams) {
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

export function tryShowInterstitial(placement?: string): Promise<boolean> {
  return showAdAndWait({
    adType: AppodealAdType.INTERSTITIAL,
    closedEvent: AppodealInterstitialEvents.CLOSED,
    failedToShowEvent: AppodealInterstitialEvents.FAILED_TO_SHOW,
    placement,
    getClosedResult: () => true,
  });
}

export function tryShowRewarded(placement?: string): Promise<boolean> {
  return showAdAndWait({
    adType: AppodealAdType.REWARDED_VIDEO,
    closedEvent: AppodealRewardedEvents.CLOSED,
    failedToShowEvent: AppodealRewardedEvents.FAILED_TO_SHOW,
    placement,
    getClosedResult: event => Boolean(event?.isFinished),
  });
}

type showAdAndWaitParams = {
  adType: AppodealAdType;
  closedEvent: string;
  failedToShowEvent: string;
  placement?: string;
  getClosedResult: (event?: any) => boolean;
};

function showAdAndWait({
  adType,
  closedEvent,
  failedToShowEvent,
  placement,
  getClosedResult,
}: showAdAndWaitParams): Promise<boolean> {
  return new Promise(resolve => {
    if (!Appodeal.canShow(adType)) {
      resolve(false);
      return;
    }

    const settle = (result: boolean) => {
      Appodeal.removeEventListener(closedEvent, handleClosed);
      Appodeal.removeEventListener(failedToShowEvent, handleFailedToShow);
      resolve(result);
    };

    const handleClosed = (event?: any) => settle(getClosedResult(event));
    const handleFailedToShow = () => settle(false);

    Appodeal.addEventListener(closedEvent, handleClosed);
    Appodeal.addEventListener(failedToShowEvent, handleFailedToShow);
    Appodeal.show(adType, placement);
  });
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
