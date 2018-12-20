import "./style/index.scss";

import config from './config';
import DataModel from './core/DataModel';
import Controller from './core/Controller';
import View from './core/View';

import * as esriLoader from 'esri-loader';

const Promise = require('es6-promise').Promise;
const esriLoaderOptions = {
    url: 'https://js.arcgis.com/4.10'
};

// before using esri-loader, tell it to use the promise library if the Promise polyfill is being used
esriLoader.utils.Promise = Promise;

// first, we use Dojo's loader to require the map class
esriLoader.loadModules([
    'esri/views/MapView', 
    'esri/WebMap',
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/portal/Portal"
], esriLoaderOptions).then(([
    MapView, WebMap,
    OAuthInfo, esriId, Portal
]) => {

    const MapControl = function(options={}){

        let mapView = null;

        const webMapID = options.webMapID || null;
        const mapViewContainerID = options.mapViewContainerID || null;

        const init = ()=>{
            if(!webMapID || ! mapViewContainerID){
                console.error('web map ID and map view container DOM ID is required to init map control');
                return;
            }

            initMapView();
        };

        const initMapView = ()=>{

            const webmap = new WebMap({
                portalItem: {
                    id: webMapID
                }
            });

            mapView = new MapView({
                map: webmap,
                container: mapViewContainerID
            });

            mapView.when(mapViewOnReadyHandler);
        };

        const initMapEventHandlers = ()=>{

        };

        const mapViewOnReadyHandler = ()=>{
            console.log('mapView is ready...');
        };

        return {
            init
        };

    };

    const OAuthManager = function(oauth_appid){

        let userCredential = null;
        let isAnonymous = true;
        let poralUser = null;
        
        const info = new OAuthInfo({
            appId: oauth_appid,
            popup: false,
        });

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

            const portal = new Portal();

            // Setting authMode to immediate signs the user in once loaded
            portal.authMode = "immediate";

            // Once loaded, user is signed in
            portal.load().then(()=>{
                poralUser = portal.user;
                // console.log(portal);
                // console.log('poralUser', poralUser);
            });
        };

        const init = ()=>{
            esriId.useSignInPage = false;
            esriId.registerOAuthInfos([info]);

            esriId.checkSignInStatus(info.portalUrl + "/sharing").then((res)=>{
                // console.log('already signed in as', res.userId);
                setUserCredential(res);
                setPortalUser();
            }).catch(()=>{
                // console.log('Anonymous view, sign in first');
                signIn();
            });
        };

        return {
            init,
            signIn,
            signOut,
            getUserContentUrl,
            isAnonymous: checkIsAnonymous
        };

    };


    (function initApp(){

        const dataModel = new DataModel();

        const view = new View();
        
        const mapControl = new MapControl({
            webMapID: config.webMapID,
            mapViewContainerID: config.DOM_ID.mapViewContainer
        });

        const controller = new Controller({
            dataModel,
            mapControl,
            view
        });

        const oauthManager = new OAuthManager(config.oauthAppID);
        oauthManager.init();

        mapControl.init();
        controller.init();

    })();

})
.catch(err => {
    // handle any errors
    console.error(err);
});