import React from 'react';
import ReactDOM from 'react-dom';
import {UserManager} from 'oidc-client';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

if (window.location.pathname === '/silent_renew') {
    new UserManager().signinSilentCallback();
} else {
    ReactDOM.render(<App />, document.getElementById('root'));
}

registerServiceWorker();
