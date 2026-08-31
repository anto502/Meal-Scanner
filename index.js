import { registerRootComponent } from 'expo';
import { Alert } from 'react-native';
import App from './App';

// Any JS crash now shows a visible message instead of silently closing
if (ErrorUtils && typeof ErrorUtils.setGlobalHandler === 'function') {
  ErrorUtils.setGlobalHandler((error) => {
    const message = error && error.message ? error.message : String(error);
    const stack = error && error.stack
      ? String(error.stack).split('\n').slice(0, 5).join('\n')
      : '';
    try {
      Alert.alert('App error (send this text)', `${message}\n\n${stack}`);
    } catch (e) {}
  });
}

registerRootComponent(App);
