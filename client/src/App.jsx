import { Provider } from "react-redux";
import { store, persistor } from "../src/store/store";
import { PersistGate } from 'redux-persist/integration/react';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import AppContent from './AppContent';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleOAuthProvider clientId="532055856231-5bvv6o4cog4srbvvghv969kfenmd33cl.apps.googleusercontent.com">
          <Toaster position="top-right"/>
          <AppContent />
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;