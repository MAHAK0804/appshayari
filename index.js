import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { AppProvider } from './AppContext';
import { Provider } from 'react-redux';
import { persistor, store } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';

const Root = () => (
  <AppProvider>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </AppProvider>
);

AppRegistry.registerComponent(appName, () => Root);
