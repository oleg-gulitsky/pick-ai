declare module 'react-native-config' {
  export interface NativeConfig {
    OPEN_ROUTER_API_KEY: string;
    APPODEAL_APP_KEY: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
