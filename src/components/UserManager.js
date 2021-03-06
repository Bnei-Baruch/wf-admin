import Keycloak from 'keycloak-js';
import mqtt from "../shared/mqtt";

const userManagerConfig = {
    url: 'https://accounts.kab.info/auth',
    realm: 'main',
    clientId: 'wf-admin',
    scope: 'profile',
    enableLogging: true,
};

export const kc = new Keycloak(userManagerConfig);

kc.onTokenExpired = () => {
    console.debug(" -- Renew token -- ");
    renewToken(0);
};

kc.onAuthLogout = () => {
    console.debug("-- Detect clearToken --");
    mqtt.setToken(null);
    kc.logout();
}

const renewToken = (retry) => {
    kc.updateToken(70)
        .then(refreshed => {
            if(refreshed) {
                document.cookie = `token=${kc.token};`;
                console.debug("-- Refreshed --");
                mqtt.setToken(kc.token);
            } else {
                console.warn('Token is still valid?..');
            }
        })
        .catch(err => {
            retry++;
            if(retry > 5) {
                console.error("Refresh retry: failed");
                console.debug("-- Refresh Failed --");
                kc.clearToken();
            } else {
                setTimeout(() => {
                    console.error("Refresh retry: " + retry);
                    renewToken(retry);
                }, 10000);
            }
        });
}



export const getUser = (callback) => {
    kc.init({onLoad: 'check-sso', checkLoginIframe: false, flow: 'standard', pkceMethod: 'S256'})
        .then(authenticated => {
            if(authenticated) {
                document.cookie = `token=${kc.token};`;
                const {realm_access: {roles}} = kc.tokenParsed;
                let user = {...kc.tokenParsed, token: kc.token, roles};
                mqtt.setToken(kc.token);
                callback(user)
            } else {
                callback(null)
            }
        }).catch((err) => console.log(err));
};

export default kc;
