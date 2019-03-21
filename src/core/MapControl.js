'use strict';

import config from '../config';
import * as esriLoader from 'esri-loader';
import hatchRed from '../static/Hatch_RedAlt.png';
import hatchBlack from '../static/Hatch_BlackAlt.png';

const Promise = require('es6-promise').Promise;

const esriLoaderOptions = {
    url: 'https://js.arcgis.com/4.10'
};

// esriLoader.loadModules([
//     "esri/layers/FeatureLayer",
// ], esriLoaderOptions).then(([
//     FeatureLayer
// ])=>{

// });

const MapControl = function(options={}){

    const webMapID = options.webMapID || null;
    const mapViewContainerID = options.mapViewContainerID || null;

    let mapView = null;
    let hucsLayer = null;
    let hucsByStatusGraphicLayer = null;
    let hucPreviewGraphicLayer = null;
    // let actualModelBoundaryLayer = null;
    let hucFeatureOnSelectHandler = null;
    // let isOnHoldEventDisabled = false;

    const init = (options={})=>{
        if(!webMapID || ! mapViewContainerID){
            console.error('web map ID and map view container DOM ID is required to init map control');
            return;
        }

        hucFeatureOnSelectHandler = options.hucFeatureOnSelectHandler || null;

        initMapView();

        initLayers();
    };

    const initMapView = ()=>{

        esriLoader.loadModules([
            'esri/views/MapView', 
            'esri/WebMap',
        ], esriLoaderOptions).then(([MapView, WebMap])=>{

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
    
            initBasemapGallery(mapView);

            initSearch(mapView);
        });

    };

    const initLayers = ()=>{

        esriLoader.loadModules([
            "esri/layers/GraphicsLayer"
        ], esriLoaderOptions).then(([
            GraphicsLayer
        ])=>{
            hucsByStatusGraphicLayer = new GraphicsLayer({
                opacity: .6
            });
        
            hucPreviewGraphicLayer = new GraphicsLayer();
        });
    };

    const initMapEventHandlers = ()=>{
        mapView.on('click', event=>{
            // console.log('map view on hold', event);

            // if(!isOnHoldEventDisabled){
            //     queryHucsLayerByMouseEvent(event);
            // }

            queryHucsLayerByMouseEvent(event)
            .then(queryHucsLayerByMouseEventOnSuccessHandler)
            .catch(err=>{
                console.log(err);
            });
            
        });
    };

    // const disableMapOnHoldEvent = ()=>{
    //     isOnHoldEventDisabled = true;
    // };

    const initBasemapGallery = (view)=>{

        esriLoader.loadModules([
            "esri/widgets/BasemapGallery",
        ], esriLoaderOptions).then(([
            BasemapGallery
        ])=>{
            const basemapGallery = new BasemapGallery({
                view: view,
                container: 'basemapGalleryDiv'
            });
        });
    };

    const initSearch = (view)=>{

        esriLoader.loadModules([
            "esri/widgets/Search",
        ], esriLoaderOptions).then(([
            Search
        ])=>{
            const searchWidget = new Search({ view, container: config.DOM_ID.searchWidgetDiv });

            // view.ui.add(searchWidget, {
            //     position: "top-left",
            //     index: 0
            // });
        }).catch(err=>{
            console.log(err);
        })
    };

    const mapViewOnReadyHandler = ()=>{
        // console.log('mapView is ready...');

        initMapEventHandlers();

        setHucsLayer(mapView.map);

        mapView.map.addMany([hucsByStatusGraphicLayer, hucPreviewGraphicLayer]);

        initPredictedHabitatLayers();

        // initLegend();
    };

    const queryHucsLayerByMouseEvent = (event)=>{
        const query = hucsLayer.createQuery();
        query.geometry = mapView.toMap(event);  // the point location of the pointer
        query.spatialRelationship = "intersects";  // this is the default
        query.returnGeometry = true;
        query.outFields = [ "*" ];
        
        return new Promise((resolve, reject)=>{

            hucsLayer.queryFeatures(query).then(function(response){
                // console.log(response);

                if(response.features && response.features.length){
                    resolve(response.features[0]);
                }
            });
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
                } else {
                    reject('no huc feature is found');
                }
            }).catch(err=>{
                reject(err);
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

    const queryHucsLayerByMouseEventOnSuccessHandler = (feature)=>{

        addPreviewHucGraphic(feature);

        if(hucFeatureOnSelectHandler){
            hucFeatureOnSelectHandler(feature);
        }
    };

    const showHucFeatureByStatus = (hucID, status, options={
        attributes: null,
        popupTemplate: null
    })=>{

        removeHucGraphicByStatus(hucID);

        if(+status > 0){
            queryHucsLayerByHucID(hucID).then(feature=>{
                addHucGraphicByStatus(feature, status, options);
            });
        } 

        // queryHucsLayerByHucID(hucID).then(feature=>{
        //     addHucGraphicByStatus(feature, status);
        // });
    };

    const addHucGraphicByStatus = (feature, status, options={})=>{

        const geometry = feature.geometry;
        const attributes = options.attributes ? {...feature.attributes, ...options.attributes} : feature.attributes;
        // const popupTemplate = options.popupTemplate || null;

        // console.log('calling addHucGraphicByStatus', feature, status);

        const symbols = {
            1: {
                type: "picture-fill",  // autocasts as new PictureFillSymbol()
                url: hatchBlack, //"https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png",
                width: "24px",
                height: "24px",
                outline: {
                    color: config.COLOR.hucBorderIsModeled,
                    width: "2px"
                },
            },
            2: {
                type: "picture-fill",  // autocasts as new PictureFillSymbol()
                url: hatchRed, //"https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png",
                width: "24px",
                height: "24px",
                outline: {
                    color: config.COLOR.hucBorderIsModeled,
                    width: "2px"
                },
            },
            3: {
                type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                color: [0, 0, 0, 0],
                outline: {  // autocasts as new SimpleLineSymbol()
                    color: config.COLOR.hucBorderCommentWithoutAction,
                    width: "4px"
                }
            }
        };

        const symbol = symbols[+status];

        esriLoader.loadModules([
            "esri/Graphic",
        ], esriLoaderOptions).then(([
            Graphic
        ])=>{

            const graphic = new Graphic({
                geometry,
                symbol,
                attributes,
                // popupTemplate
            });

            hucsByStatusGraphicLayer.add(graphic);

        }).catch(err=>{
            console.error(err);
        })

    };

    const removeHucGraphicByStatus = (hucID)=>{
        // console.log('removeHucGraphicByStatus', hucID);
        hucsByStatusGraphicLayer.graphics.forEach(g=>{
            if(g && g.attributes && g.attributes[config.FIELD_NAME.huc10LayerHucID] === hucID){
                hucsByStatusGraphicLayer.remove(g);
            }
        })
    };

    const addPreviewHucByID = async (hucID)=>{
        const hucFeature = await queryHucsLayerByHucID(hucID);
        addPreviewHucGraphic(hucFeature)
    }

    const addPreviewHucGraphic = (feature)=>{
        // const attributes = feature.attributes;

        cleanPreviewHucGraphic();

        const symbol = {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: [0, 0, 0, 0],
            outline: {  // autocasts as new SimpleLineSymbol()
                color: [84, 242, 242, 0.75],
                width: "2.5px"
            }
        };

        esriLoader.loadModules([
            "esri/Graphic",
        ], esriLoaderOptions).then(([
            Graphic
        ])=>{
            const graphicForSelectedHuc = new Graphic({
                geometry: feature.geometry,
                symbol: symbol,
            });
    
            hucPreviewGraphicLayer.add(graphicForSelectedHuc);
        });
    };

    const clearMapGraphics = (targetLayer='')=>{
        const layersLookup = {
            'hucPreview': hucPreviewGraphicLayer
        };

        if(layersLookup[targetLayer]){
            layersLookup[targetLayer].removeAll();
        } else {
            clearAllGraphics();
        }
    }

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
                width: "1px"
            }
        }

        const symbol = {
            type: "simple-fill",  // autocasts as new SimpleFillSymbol()
            color: config.COLOR.hucFill,
            outline: {  // autocasts as new SimpleLineSymbol()
                color: config.COLOR.hucBorderIsModeled,
                width: "2px"
            }
        };

        // const symbol = {
        //     type: "picture-fill",  // autocasts as new PictureFillSymbol()
        //     url: dashImg, //"https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png",
        //     width: "16px",
        //     height: "16px",
        //     opacity: .75,
        //     outline: {
        //         color: config.COLOR.hucBorderIsModeled,
        //         width: "1px"
        //     },
        // };

        const uniqueValueInfos = data.map(d=>{
            return {
                value: d[config.FIELD_NAME.speciesDistribution.hucID],
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
    };

    const initPredictedHabitatLayers = ()=>{
        // console.log(url);

        // if(actualModelBoundaryLayer){
        //     mapView.map.remove(actualModelBoundaryLayer);
        // }

        esriLoader.loadModules([
            "esri/layers/FeatureLayer",
        ], esriLoaderOptions).then(([
            FeatureLayer
        ])=>{

            const predictedHabitatLayers = [config.URL.PredictedHabitat.line, config.URL.PredictedHabitat.polygon].map(url=>{

                return new FeatureLayer({
                    url,
                    opacity: .8,
                    definitionExpression: `cutecode=''`,
                    isPredictedHabitatLayer: true
                });
            });
    
            mapView.map.addMany(predictedHabitatLayers);

        });

        // mapView.map.reorder(actualModelBoundaryLayer, 0);

    };

    const showPredictedHabitatLayers = (speciesCode='')=>{
        mapView.map.layers.forEach(layer=>{
            // console.log(layer);

            if(layer.isPredictedHabitatLayer){
                // console.log(la)

                layer.definitionExpression = `cutecode='${speciesCode}'`;
            }

            layer.refresh();

        });
    }

    const setLayersOpacity = (val)=>{
        mapView.map.layers.forEach(layer=>{
            // console.log(layer);
            layer.opacity = val;
        });
    };

    return {
        init,
        highlightHucs,
        cleanPreviewHucGraphic,
        showHucFeatureByStatus,
        // addActualModelBoundaryLayer,
        clearAllGraphics,
        // disableMapOnHoldEvent,
        queryHucsLayerByHucID,
        addPreviewHucGraphic,
        setLayersOpacity,
        clearMapGraphics,
        addPreviewHucByID,
        showPredictedHabitatLayers
    };

};

export default MapControl;