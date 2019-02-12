
import * as esriLoader from 'esri-loader';

const Promise = require('es6-promise').Promise;
const esriLoaderOptions = {
    url: 'https://js.arcgis.com/4.10'
};
// before using esri-loader, tell it to use the promise library if the Promise polyfill is being used
esriLoader.utils.Promise = Promise;

const OAuthManager = function(oauth_appid){

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
                poralUser = portal.user;
            });
        });

    };

    const init = ()=>{

        console.log('init oauth manager');

        return new Promise((resolve, reject)=>{

            esriLoader.loadModules([
                "esri/identity/OAuthInfo",
                "esri/identity/IdentityManager",
            ], esriLoaderOptions).then(([
                OAuthInfo, IdentityManager
            ]) => {

                esriId = IdentityManager;

                info = new OAuthInfo({
                    appId: oauth_appid,
                    popup: false,
                });

                esriId.useSignInPage = false;

                esriId.registerOAuthInfos([info]);

                esriId.checkSignInStatus(info.portalUrl + "/sharing").then((res)=>{
                    // console.log('already signed in as', res.userId);
                    setUserCredential(res);
                    setPortalUser();
                    resolve(res);
    
                }).catch(()=>{
                    // console.log('Anonymous view, sign in first');
                    signIn();
                });
            
            }).catch(err=>{
                console.error(err);
            })

        });

    };

    const getUserID = ()=>{
        // console.log(poralUser);
        return poralUser ? poralUser.username : userCredential.userId;
    };

    return {
        init,
        signIn,
        signOut,
        getUserContentUrl,
        isAnonymous: checkIsAnonymous,
        getUserID
    };

};

export default OAuthManager;