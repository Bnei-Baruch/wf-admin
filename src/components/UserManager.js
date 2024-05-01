import Keycloak from 'keycloak-js';
import mqtt from "../shared/mqtt";

const userManagerConfig = {
    url: 'https://accounts.kab.info/auth',
    realm: 'main',
    clientId: 'wf-admin'
};

const initOptions = {
    onLoad: "check-sso",
    checkLoginIframe: false,
    flow: "standard",
    pkceMethod: "S256",
    enableLogging: true
};

export const kc = new Keycloak(userManagerConfig);

kc.onTokenExpired = () => {
    renewToken(0);
};

kc.onAuthLogout = () => {
    console.log("-- LogOut --");
    mqtt.setToken(null);
    kc.logout();
}

const renewToken = (retry) => {
    kc.updateToken(5)
        .then(refreshed => {
            if(refreshed) {
                setData();
            } else {
                console.warn('Token is still valid?..');
            }
        })
        .catch(() => {
            retry++;
            if(retry > 10) {
                kc.clearToken();
            } else {
                setTimeout(() => {
                    renewToken(retry);
                }, 10000);
            }
        });
}

const setData = () => {
    document.cookie = `token=${kc.token};`;
    const {realm_access: {roles}} = kc.tokenParsed;
    let user = {...kc.tokenParsed, token: kc.token, roles};
    console.log(user)
    mqtt.setToken(kc.token);
    return user;
}

export const getUser = (callback) => {
    kc.init(initOptions)
        .then(authenticated => {
            const user = authenticated ? setData() : null;
            callback(user);
        }).catch(err => console.error(err));
};

export default kc;
