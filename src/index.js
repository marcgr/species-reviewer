import "./style/index.scss";

import config from './config';
import DataModel from './core/DataModel';
import Controller from './core/Controller';
import View from './core/View';

import * as esriLoader from 'esri-loader';
import { resolve } from "path";

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
    "esri/layers/GraphicsLayer",
    "esri/Graphic",
    // "esri/widgets/Legend",
    "esri/identity/OAuthInfo",
    "esri/identity/IdentityManager",
    "esri/portal/Portal"
], esriLoaderOptions).then(([
    MapView, WebMap, 
    GraphicsLayer, Graphic,
    // Legend,
    OAuthInfo, esriId, Portal
]) => {

    const MapControl = function(options={}){

        let mapView = null;
        let hucsLayer = null;
        let hucFeatureOnSelectHandler = null;
        let hucsByStatusGraphicLayer = new GraphicsLayer();
        let hucPreviewGraphicLayer = new GraphicsLayer();

        const webMapID = options.webMapID || null;
        const mapViewContainerID = options.mapViewContainerID || null;

        const init = (options={})=>{
            if(!webMapID || ! mapViewContainerID){
                console.error('web map ID and map view container DOM ID is required to init map control');
                return;
            }

            hucFeatureOnSelectHandler = options.hucFeatureOnSelectHandler || null;

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
            mapView.on('hold', event=>{
                // console.log('map view on hold', event);
                queryHucsLayerByMouseEvent(event);
            });
        };

        // const initLegend = ()=>{
        //     var legend = new Legend({
        //         view: mapView,
        //         layerInfos: [{
        //             layer: hucsLayer,
        //             title: "Legend"
        //         }]
        //     });
              
        //     mapView.ui.add(legend, "bottom-right");
        // }

        const mapViewOnReadyHandler = ()=>{
            // console.log('mapView is ready...');

            initMapEventHandlers();

            setHucsLayer(mapView.map);

            mapView.map.addMany([hucsByStatusGraphicLayer, hucPreviewGraphicLayer]);

            // initLegend();
        };

        const queryHucsLayerByMouseEvent = (event)=>{
            const query = hucsLayer.createQuery();
            query.geometry = mapView.toMap(event);  // the point location of the pointer
            query.spatialRelationship = "intersects";  // this is the default
            query.returnGeometry = true;
            query.outFields = [ "*" ];
            
            hucsLayer.queryFeatures(query).then(function(response){
                // console.log(response);

                if(response.features && response.features.length){
                    setPreviewHuc(response.features[0]);
                }
            });

        };

        const queryHucsLayerByHucID = (hucID)=>{
            const query = hucsLayer.createQuery();
            query.where = `${config.FIELD_NAME.huc10LayerHucID} = '${hucID}'`;
            query.returnGeometry = true;
            query.outFields = [ "*" ];
            
            return new Promise((resolve, reject)=>{

                hucsLayer.queryFeatures(query).then(function(response){
                    if(response.features && response.features.length){
                        // console.log(response.features[0]);
                        resolve(response.features[0]);
                    }
                });
            });

        };

        const setHucsLayer = (webmap)=>{
            // console.log(webmap.layers.items);

            hucsLayer = webmap.layers.items.filter(d=>{
                return d.title.indexOf('HUC10') !== -1 
            })[0];

            // console.log(hucsLayer);
        };

        const setPreviewHuc = (feature)=>{

            addPreviewHucGraphic(feature);

            if(hucFeatureOnSelectHandler){
                hucFeatureOnSelectHandler(feature);
            }
        };

        const toggleHucGraphicByStatus = (hucID, status)=>{

            removeHucGraphicByStatus(hucID);

            if(+status > 0){
                queryHucsLayerByHucID(hucID).then(feature=>{
                    addHucGraphicByStatus(feature, status);
                });
            } 

            // queryHucsLayerByHucID(hucID).then(feature=>{
            //     addHucGraphicByStatus(feature, status);
            // });
        };

        const addHucGraphicByStatus = (feature, status)=>{

            // console.log('calling addHucGraphicByStatus', status);

            const geometry = feature.geometry;
            const attributes = feature.attributes;

            const colorLookup = [
                config.COLOR.status0,
                config.COLOR.status1,
                config.COLOR.status2
            ];

            const symbol = {
                type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                color: colorLookup[+status],
                outline: {  // autocasts as new SimpleLineSymbol()
                    color: config.COLOR.hucBorder,
                    width: "0.5px"
                }
            };

            const graphic = new Graphic({
                geometry,
                symbol,
                attributes
            });

            hucsByStatusGraphicLayer.add(graphic);
        };

        const removeHucGraphicByStatus = (hucID)=>{
            // console.log('removeHucGraphicByStatus', hucID);
            hucsByStatusGraphicLayer.graphics.forEach(g=>{
                if(g && g.attributes && g.attributes[config.FIELD_NAME.huc10LayerHucID] === hucID){
                    hucsByStatusGraphicLayer.remove(g);
                }
            })
        };

        const addPreviewHucGraphic = (feature)=>{
            // const attributes = feature.attributes;

            cleanPreviewHucGraphic();

            const symbol = {
                type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                color: [0, 0, 0, 0],
                outline: {  // autocasts as new SimpleLineSymbol()
                    color: [255, 50, 50, 0.75],
                    width: "2px"
                }
            };

            const graphicForSelectedHuc = new Graphic({
                geometry: feature.geometry,
                symbol: symbol,
            });

            hucPreviewGraphicLayer.add(graphicForSelectedHuc);
        };

        const clearAllGraphics = ()=>{
            hucsByStatusGraphicLayer.removeAll();
            cleanPreviewHucGraphic();
        };

        const cleanPreviewHucGraphic = ()=>{
            hucPreviewGraphicLayer.removeAll();
        };

        // highlight hucs from the species extent table
        const highlightHucs = (data)=>{
            // cleanPreviewHucGraphic();
            clearAllGraphics();
            hucsLayer.renderer = getUniqueValueRenderer(data);
        };

        const getUniqueValueRenderer = (data)=>{

            const defaultSymbol = {
                type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                color: [0,0,0, 0],
                outline: {  // autocasts as new SimpleLineSymbol()
                    color: config.COLOR.hucBorder,
                    width: "0.5px"
                }
            }

            const symbol = {
                type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                color: config.COLOR.hucFill,
                outline: {  // autocasts as new SimpleLineSymbol()
                    color: config.COLOR.hucBorder,
                    width: "0.5px"
                }
            };

            const uniqueValueInfos = data.map(d=>{
                return {
                    value: d[config.FIELD_NAME.speciesLookupHucID],
                    symbol: symbol
                }
            });

            const renderer = {
                type: "unique-value",  // autocasts as new UniqueValueRenderer()
                field: config.FIELD_NAME.huc10LayerHucID,
                defaultSymbol: defaultSymbol, //{ type: "none" },  // autocasts as new SimpleFillSymbol()
                uniqueValueInfos: uniqueValueInfos
            };

            return renderer;
        }

        return {
            init,
            highlightHucs,
            cleanPreviewHucGraphic,
            toggleHucGraphicByStatus
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

            return new Promise((resolve, reject)=>{

                esriId.checkSignInStatus(info.portalUrl + "/sharing").then((res)=>{
                    // console.log('already signed in as', res.userId);
                    setUserCredential(res);
                    setPortalUser();

                    resolve(res);

                }).catch(()=>{
                    // console.log('Anonymous view, sign in first');
                    signIn();
                });
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


    (function initApp(){

        const dataModel = new DataModel();

        const view = new View();
        
        const mapControl = new MapControl({
            webMapID: config.webMapID,
            mapViewContainerID: config.DOM_ID.mapViewContainer,
        });

        const oauthManager = new OAuthManager(config.oauthAppID);

        const controller = new Controller({
            dataModel,
            mapControl,
            view,
            oauthManager
        });

        oauthManager.init().then(credential=>{
            // console.log('user credential', credential);

            const token = credential.token;

            mapControl.init({
                hucFeatureOnSelectHandler: (hucFeature)=>{
                    // console.log('selected hucFeature', hucFeature);
                    controller.setSelectedHucFeature(hucFeature);
                }
            });

            // view.init();

            view.feedbackControlPanel.init({
                containerID: config.DOM_ID.feedbackControl,
                onCloseHandler: ()=>{
                    controller.resetSelectedHucFeature();
                },
                // statusOnChange: (val)=>{
                //     // console.log(val);
                //     // const status = controller.dataModel.getStatusByIndex(val);
                //     controller.feedbackManager.feedbackDataModel.setStatus(val);
                // },
                commentOnChange: (val)=>{
                    // console.log(val);
                    controller.feedbackManager.feedbackDataModel.setComment(val);
                },
                onSubmitHandler: (status)=>{
                    // console.log('submit btn on click, new status >', status);
                    if(status){
                        controller.feedbackManager.feedbackDataModel.setStatus(status);
                    }
                    controller.feedbackManager.submit();
                },
                onRemoveHandler: ()=>{
                    controller.feedbackManager.remove();
                }
            });

            controller.init({
                token
            });

        });


        window.appDebugger = {
            signOut: oauthManager.signOut
        };

    })();

})
.catch(err => {
    // handle any errors
    console.error(err);
});