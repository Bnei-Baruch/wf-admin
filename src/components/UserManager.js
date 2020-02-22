import { Log as oidclog, UserManager } from 'oidc-client';
import {KJUR} from 'jsrsasign';

const AUTH_URL = 'https://accounts.kbb1.com/auth/realms/main';

oidclog.logger = console;
oidclog.level  = 0;

const userManagerConfig = {
    authority: AUTH_URL,
    client_id: 'wf-admin',
    redirect_uri: window.location.href,
    response_type: 'token id_token',
    scope: 'openid profile',
    post_logout_redirect_uri: window.location.href,
    automaticSilentRenew: false,
    silent_redirect_uri: window.location.href + "silent_renew.html",
    filterProtocolClaims: true,
    loadUserInfo: true,
};

export const client = new UserManager(userManagerConfig);

client.events.addAccessTokenExpiring(() => {
    console.log("...RENEW TOKEN...");
    client.signinSilent().then(user => {
        if(user) document.cookie = `token=${user.access_token};`;
    }).catch((error) => {
        console.log("SigninSilent error: ",error);
    });
});

client.events.addAccessTokenExpired(() => {
    console.log("...!TOKEN EXPIRED!...");
    client.signoutRedirect();
});

export const getUser = (cb) =>
    client.getUser().then((user) => {
        if(user) {
            document.cookie = `token=${user.access_token};`;
            let at = KJUR.jws.JWS.parse(user.access_token);
            let roles = at.payloadObj.realm_access.roles;
            user = {...user.profile, token: user.access_token, roles};
        }
        cb(user)
    })
    .catch((error) => {
        console.log("Error: ",error);
    });

export default client;
