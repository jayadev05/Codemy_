window.global = window; // Polyfill 'global'


import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';



createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="532055856231-j5nl4i0ir43vs6tgrpnqsjrhphpk1prr.apps.googleusercontent.com">
    <StrictMode>
      <App />
    </StrictMode>
  </GoogleOAuthProvider>
);
