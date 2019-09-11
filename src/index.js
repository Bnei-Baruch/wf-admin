import React from 'react';
import ReactDOM from 'react-dom';
import {client,BASE_URL} from './components/UserManager';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

if (window.location.pathname === '/silent_renew') {
    client.signinSilentCallback(`${BASE_URL}`);
} else {
    ReactDOM.render(<App />, document.getElementById('root'));
}

registerServiceWorker();
