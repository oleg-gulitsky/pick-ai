import remoteConfig from '@react-native-firebase/remote-config';
import { MODELS, setCurrentModel } from '../../services/openRouterAI';

export function initRemoteConfig() {
  remoteConfig()
    .setDefaults({
      current_model: MODELS.Deepseek_R1_0528_Qwen3_8B,
    })
    .then(() => remoteConfig().fetchAndActivate())
    .then(fetchedRemotely => {
      if (fetchedRemotely) {
        console.log('Configs were retrieved from the backend and activated.');
      } else {
        console.log(
          'No configs were fetched from the backend, and the local configs were already activated',
        );
      }
    })
    .then(() => {
      const currentModel = remoteConfig().getValue('current_model').asString();
      setCurrentModel(currentModel);
    });
}
