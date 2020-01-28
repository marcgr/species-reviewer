
import * as esriLoader from 'esri-loader';
import config from '../config';

const Promise = require('es6-promise').Promise;
const esriLoaderOptions = {
    url: 'https://js.arcgis.com/4.14'
};
// before using esri-loader, tell it to use the promise library if the Promise polyfill is being used
esriLoader.utils.Promise = Promise;

const OAuthManager = function(oauth_appid, portalUrl){


    let userCredential = null;
    let isAnonymous = true;
    let poralUser = null;
    let info = null;
    let esriId = null;


    const signIn = ()=>{
        esriId.getCredential(info.portalUrl + "/sharing").then((res)=>{
            setUserCredential(res);
        });
    };

    const signOut = ()=>{
        esriId.destroyCredentials();
        window.location.reload();
    };

    const setUserCredential = (credentialObject)=>{
        userCredential = credentialObject;
        isAnonymous = credentialObject ? false : true;
        // console.log(credentialObject);
    };

    const getUserContentUrl = ()=>{
        const outputUrl =  `${userCredential.server}/sharing/rest/content/users/${userCredential.userId}`;
        return outputUrl
    };

    const checkIsAnonymous = ()=>{
        return isAnonymous;
    };

    const setPortalUser = ()=>{

        return new Promise((resolve, reject)=>{

            esriLoader.loadModules([
                "esri/portal/Portal"
            ], esriLoaderOptions).then(([
                Portal
            ])=>{

                const portal = new Portal();

                // Setting authMode to immediate signs the user in once loaded
                portal.authMode = "immediate";

                // Once loaded, user is signed in
                portal.load().then(()=>{
                    resolve(portal.user);
                }).catch(err=>{
                    reject(err);
                });
            });
        });

    };

    const init = ()=>{

        // console.log('init oauth manager');

        return new Promise((resolve, reject)=>{

            esriLoader.loadModules([
                "esri/identity/OAuthInfo",
                "esri/identity/IdentityManager",
                "esri/config"
            ], esriLoaderOptions).then(([
                OAuthInfo, IdentityManager, EsriConfig
            ]) => {

                EsriConfig.portalUrl = portalUrl;
                esriId = IdentityManager;

                info = new OAuthInfo({
                    appId: oauth_appid,
                    portalUrl: config.portalUrl,
                    popup: false,
                });

                esriId.useSignInPage = true;

                esriId.registerOAuthInfos([info]);

                esriId.checkSignInStatus(info.portalUrl + "/sharing").then((res)=>{
                    // console.log('already signed in as', res.userId);
                    setUserCredential(res);

                    setPortalUser().then(res=>{
                        poralUser = res;
                        resolve(res);
                    });

                }).catch(()=>{
                    // console.log('Anonymous view, sign in first');
                    signIn();
                });

            }).catch(err=>{
                reject(err);
                console.error(err);
            })

        });

    };

    const getUserID = ()=>{
        // console.log(poralUser);
        return poralUser ? poralUser.username : userCredential.userId;
    };

    const getToken = ()=>{
        return userCredential.token;
    };

    const getPoralUser = ()=>{
        return poralUser;
    }

    return {
        init,
        signIn,
        signOut,
        getUserContentUrl,
        isAnonymous: checkIsAnonymous,
        getUserID,
        getToken,
        getPoralUser
    };

};

export default OAuthManager;