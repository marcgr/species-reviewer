'use strict';

import config from '../config';
import * as esriLoader from 'esri-loader';
import hatchRed from '../static/Hatch_RedAlt.png';
import hatchBlack from '../static/Hatch_BlackAlt.png';

const Promise = require('es6-promise').Promise;

const esriLoaderOptions = {
    url: 'https://js.arcgis.com/4.14' //actual set in oauthmanager where esriloader first called
};

// esriLoader.loadModules([
//     "esri/layers/FeatureLayer",
// ], esriLoaderOptions).then(([
//     FeatureLayer
// ])=>{

// });

const MapControl = function (options = {}) {

    const webMapID = options.webMapID || null;
    const mapViewContainerID = options.mapViewContainerID || null;
    const portalUrl = options.portalUrl || null;

    let mapView = null;
    let hucsLayer = null;
    let hucsByStatusGraphicLayer = null;
    let hucPreviewGraphicLayer = null;
    let isInDrawMode = false;
    let isInBatchSelectMode = false;
    // let actualModelBoundaryLayer = null;
    let hucFeatureOnSelectHandler = null;
    // let isOnHoldEventDisabled = false;

    const init = (options = {}) => {
        if (!webMapID || !mapViewContainerID) {
            console.error('web map ID and map view container DOM ID is required to init map control');
            return;
        }

        hucFeatureOnSelectHandler = options.hucFeatureOnSelectHandler || null;

        initMapView();
    };

    const initMapView = () => {

        esriLoader.loadModules([
            'esri/views/MapView',
            'esri/config',
            'esri/WebMap',
        ], esriLoaderOptions).then(([MapView, EsriConfig, WebMap]) => {

            EsriConfig.portalUrl = portalUrl;

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

        });

    };

    const initLayerList = (mapView) => {

        esriLoader.loadModules([
            "esri/widgets/LayerList"
        ], esriLoaderOptions).then(([
            LayerList,
        ]) => {
            const layerlist = new LayerList({
                container: config.DOM_ID.layerListDiv,
                view: mapView,
                listItemCreatedFunction: function (event) {
                    const item = event.item;
                    if (item.layer.type != "group") {
                        // don't show legend twice
                        item.panel = {
                            content: "legend",
                            open: false
                        };
                    }
                }
            });
        }).catch(err => {
            console.error(err);
        })
    };

    const initReferenceLayers = (mapView) => {

        // Layer.fromPortalItem({
        //     portalItem: {  // autocasts new PortalItem()
        //         id: "dd6077b7b71c4492aceab1ae0146ad1c"
        //     }
        // }).then(function(layer){
        //     // add the layer to the map
        //     mapView.map.add(layer);
        // });

        esriLoader.loadModules([
            "esri/layers/MapImageLayer",
            "esri/layers/ImageryLayer"
        ], esriLoaderOptions).then(([
            MapImageLayer,
            ImageryLayer
        ]) => {

            const defaultOpacity = .7;

            // USA Protected Areas
            const usaProtectedAreas = new ImageryLayer({
                portalItem: { // autocasts as esri/portal/PortalItem
                    id: config.reference_layers.usa_protected_areas.itemId
                },
                title: config.reference_layers.usa_protected_areas.title,
                opacity: defaultOpacity,
                visible: false
            });

            // USA_NLCD_Land_Cover_2011
            const nlcdLandCover = new ImageryLayer({
                portalItem: { // autocasts as esri/portal/PortalItem
                    id: config.reference_layers.USA_NLCD_Land_Cover_2011.itemId
                },
                title: config.reference_layers.USA_NLCD_Land_Cover_2011.title,
                opacity: defaultOpacity,
                visible: false
            });

            // USA_Forest_Type
            const forestType = new ImageryLayer({
                portalItem: { // autocasts as esri/portal/PortalItem
                    id: config.reference_layers.USA_Forest_Type.itemId
                },
                title: config.reference_layers.USA_Forest_Type.title,
                opacity: defaultOpacity,
                visible: false
            });

            // USA_Wetlands
            const wetLand = new MapImageLayer({
                portalItem: { // autocasts as esri/portal/PortalItem
                    id: config.reference_layers.USA_Wetlands.itemId
                },
                title: config.reference_layers.USA_Wetlands.title,
                opacity: defaultOpacity,
                visible: false
            });

            // mapView.map.addMany([usaProtectedAreas, nlcdLandCover, forestType, wetLand]);
            mapView.map.add(usaProtectedAreas, 0);
            mapView.map.add(nlcdLandCover, 0);
            mapView.map.add(forestType, 0);
            mapView.map.add(wetLand, 0);
        }).catch(err => {
            console.error(err);
        })
    };

    const initHucLayer = (mapView) => {
        esriLoader.loadModules([
            "esri/layers/FeatureLayer",
        ], esriLoaderOptions).then(([
            FeatureLayer
        ]) => {

            hucsLayer = new FeatureLayer({
                url: config.URL.WatershedBoundaryDataset_HUC12,
                opacity: .9,
                listMode: 'hide',
                renderer: {
                    type: "simple", // autocasts as new SimpleRenderer()
                    symbol: {
                        type: "simple-fill", // autocasts as new SimpleFillSymbol()
                        color: [0, 0, 0, 0],
                        outline: { // autocasts as new SimpleLineSymbol()
                            color: [0, 0, 0, 0],
                            width: "0"
                        }
                    }
                }
            });

            mapView.map.add(hucsLayer);

        });
    }

    const initHucsReviewReferenceLayers = (mapView) => {

        esriLoader.loadModules([
            "esri/layers/GraphicsLayer"
        ], esriLoaderOptions).then(([
            GraphicsLayer
        ]) => {
            hucsByStatusGraphicLayer = new GraphicsLayer({
                opacity: .6,
                listMode: 'hide'
            });

            hucPreviewGraphicLayer = new GraphicsLayer({
                listMode: 'hide'
            });

            mapView.map.addMany([hucsByStatusGraphicLayer, hucPreviewGraphicLayer]);
        });
    };

    const initMapEventHandlers = () => {
        mapView.on('click', event => {
            console.log('map view on hold', event, isInDrawMode);

            // if(!isOnHoldEventDisabled){
            //     queryHucsLayerByMouseEvent(event);
            // }
            if (!isInDrawMode || isInBatchSelectMode) {
                console.log('clicked again???????',isInDrawMode,isInDrawMode);
                //mapView.graphics.removeAll();
                let mapPt = mapView.toMap(event)
                queryHucsLayerByMouseEvent(mapPt)
                    .then(queryHucsLayerByMouseEventOnSuccessHandler)
                    .catch(err => {
                        console.log(err);
                    });
            }
        });

        mapView.on('key-down', event => {
            isInBatchSelectMode = event.key === 'Control';
            console.log('key down event is in batch select mode?', isInBatchSelectMode);
        });

        mapView.on('key-up', event => {
            isInBatchSelectMode = false;
        });
    };

    // const disableMapOnHoldEvent = ()=>{
    //     isOnHoldEventDisabled = true;
    // };

    const initBasemapGallery = (view) => {

        esriLoader.loadModules([
            "esri/widgets/BasemapGallery",
            "esri/widgets/Expand"
        ], esriLoaderOptions).then(([
            BasemapGallery,
            Expand
        ]) => {
            const basemapGallery = new BasemapGallery({
                view
            });

            const bgExpand = new Expand({
                view,
                content: basemapGallery
            });

            mapView.ui.add(bgExpand, "top-left");
        });
    };

    const initHomeButton = (view) => {
        esriLoader.loadModules(["esri/widgets/Home"], esriLoaderOptions).then(([
            Home
        ]) => {
            const homeBtn = new Home({
                view: view
            });
            view.ui.add(homeBtn, "top-left");
        });
    }

    const initLegend = (view) => {
        esriLoader.loadModules(["esri/widgets/Legend", "esri/widgets/Expand"], esriLoaderOptions).then(([
            Legend, Expand
        ]) => {
            const legend = new Expand({
                content: new Legend({
                view: view
            }),
            view: view,
            expanded:false});
            view.ui.add(legend, "bottom-left");
        });
    }

    const initBatchSelectTools = (view) => {
        esriLoader.loadModules([
                "esri/views/draw/Draw",
                "esri/Graphic",
                "esri/geometry/Polyline"
            ], esriLoaderOptions)
            .then(([Draw, Graphic, Polyline]) => {
                view.ui.add("line-button", "top-left");
                //view.ui.add("esri-icon-polyline",)

                const draw = new Draw({
                    view: view
                });

                document.getElementById("line-button").onclick = () => {
                    console.log('line-button clicked', isInDrawMode);
                    isInDrawMode = true;
                    let thisScope = this;
                    view.graphics.removeAll();

                    // creates and returns an instance of PolyLineDrawAction
                    const action = draw.create("polyline", "freehand");

                    // focus the view to activate keyboard shortcuts for sketching
                    view.focus();

                    // listen polylineDrawAction events to give immediate visual feedback
                    // to users as the line is being drawn on the view.
                    action.on(
                        ["vertex-remove", "cursor-update", "redo", "undo"],
                        updateVertices
                    );

                    action.on(["vertex-add", "draw-complete"], function (event) {
                        // create a polyline from returned vertices
                        if (event.vertices.length > 1) {
                            createGraphic(event);
                        }
                        if (event.type === "draw-complete") {
                            console.log('drawing Complete! Is in drawmode?  getState?', isInDrawMode, getSelectState());
                            var polyline = new Polyline({
                                paths: event.vertices,
                                spatialReference: view.spatialReference
                            });
                            queryHucsLayerByMouseEvent(polyline)
                                .then(queryHucsLayerByMouseEventOnSuccessHandler)
                                .then(view.graphics.removeAll())
                                .then(window.setTimeout(()=>{isInDrawMode = false},500))
                                .catch(err => {
                                    console.log(err);
                                });
                        }

                    });
                };

                // Checks if the last vertex is making the line intersect itself.
                const updateVertices = (event) => {
                    // create a polyline from returned vertices
                    if (event.vertices.length > 1) {
                        createGraphic(event);
                    }
                }

                // create a new graphic presenting the polyline that is being drawn on the view
                const createGraphic = (event) => {
                    const vertices = event.vertices;
                    view.graphics.removeAll();

                    // a graphic representing the polyline that is being drawn
                    const graphic = new Graphic({
                        geometry: {
                            type: "polyline",
                            paths: vertices,
                            spatialReference: view.spatialReference
                        },
                        symbol: {
                            type: "simple-line", // autocasts as new SimpleFillSymbol
                            color: [4, 90, 141],
                            width: 4,
                            cap: "round",
                            join: "round"
                        }
                    });

                    view.graphics.add(graphic);
                }


            });
    }

    const initSearch = (view) => {

        esriLoader.loadModules([
            "esri/widgets/Search",
            "esri/widgets/Expand"
        ], esriLoaderOptions).then(([
            Search, Expand
        ]) => {
            const searchWidget = new Search({
                view,
                container: config.DOM_ID.searchWidgetDiv
            });

            // view.ui.add(searchWidget, {
            //     position: "top-left",
            //     index: 0
            // });
        }).catch(err => {
            console.log(err);
        })
    };

    const mapViewOnReadyHandler = () => {
        // console.log('mapView is ready...');
        initMapEventHandlers();

        initBasemapGallery(mapView);

        initHomeButton(mapView);

        //initLegend(mapView);

        initBatchSelectTools(mapView);

        initReferenceLayers(mapView);

        initHucLayer(mapView);

        initHucsReviewReferenceLayers(mapView);

        //initPredictedHabitatLayers(mapView);

        initSearch(mapView);

        initLayerList(mapView);


        // setHucsLayer(mapView.map);

        // mapView.map.addMany([hucsByStatusGraphicLayer, hucPreviewGraphicLayer]);

        // initPredictedHabitatLayers();

        // initLegend();
    };

    const queryHucsLayerByMouseEvent = (geometry) => {
        const query = hucsLayer.createQuery();
        query.geometry = geometry; // the point location of the pointer
        query.spatialRelationship = "intersects"; // this is the default
        query.returnGeometry = true;
        query.outFields = ["*"];

        return new Promise((resolve, reject) => {

            hucsLayer.queryFeatures(query).then(function (response) {
                console.log('queryHUCSLayerresponse', geometry);

                if (response.features && response.features.length) {
                    resolve(response.features);
                }
            });
        });

    };

    const queryHucsLayerByHucID = (hucID) => {
        const query = hucsLayer.createQuery();
        query.where = `${config.FIELD_NAME.hucLayerHucID} = '${hucID}'`;
        query.returnGeometry = true;
        query.outFields = ["*"];

        return new Promise((resolve, reject) => {

            hucsLayer.queryFeatures(query).then(function (response) {
                if (response.features && response.features.length) {
                    // console.log(response.features[0]);
                    resolve(response.features[0]);
                } else {
                    reject('no huc feature is found');
                }
            }).catch(err => {
                reject(err);
            });
        });

    };

    const getSelectState = () =>{
        console.log('get select state', isInBatchSelectMode, isInDrawMode)
        return isInBatchSelectMode || isInDrawMode;
    }

    // const setHucsLayer = (webmap)=>{
    //     console.log(webmap.layers.items);

    //     hucsLayer = webmap.layers.items.filter(d=>{
    //         console.log(d.title)
    //         return d.title.indexOf('HUC10') !== -1
    //     })[0];

    //     // hucsLayer.listMode = 'hide';

    //     console.log('setHucsLayer', hucsLayer);
    // };

    const queryHucsLayerByMouseEventOnSuccessHandler = (features) => {
        let intialSelectState = getSelectState();
        features.forEach(feature => {
            addPreviewHucGraphic(feature);

            if (hucFeatureOnSelectHandler) {
                hucFeatureOnSelectHandler(feature, intialSelectState);
            }
        });
    };

    const showHucFeatureByStatus = (hucID, status, options = {
        attributes: null,
        popupTemplate: null
    }) => {
        console.log('KKKKKKKKKKKKKKKKK',hucID,status,options,isInBatchSelectMode);
        if (!isInBatchSelectMode){
            removeHucGraphicByStatus(hucID);
        }


        if (+status > 0) {
            queryHucsLayerByHucID(hucID).then(feature => {
                addHucGraphicByStatus(feature, status, options);
            });
        }

        // queryHucsLayerByHucID(hucID).then(feature=>{
        //     addHucGraphicByStatus(feature, status);
        // });
    };

    const addHucGraphicByStatus = (feature, status, options = {}) => {

        const geometry = feature.geometry;
        const attributes = options.attributes ? {
            ...feature.attributes,
            ...options.attributes
        } : feature.attributes;
        // const popupTemplate = options.popupTemplate || null;

        // console.log('calling addHucGraphicByStatus', feature, status);

        const symbols = {
            1: {
                type: "picture-fill", // autocasts as new PictureFillSymbol()
                url: hatchBlack, //"https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png",
                width: "24px",
                height: "24px",
                outline: {
                    color: config.COLOR.hucBorderIsModeled,
                    width: "2px"
                },
            },
            2: {
                type: "picture-fill", // autocasts as new PictureFillSymbol()
                url: hatchRed, //"https://static.arcgis.com/images/Symbols/Shapes/BlackStarLargeB.png",
                width: "24px",
                height: "24px",
                outline: {
                    color: config.COLOR.hucBorderIsModeled,
                    width: "2px"
                },
            },
            3: {
                type: "simple-fill", // autocasts as new SimpleFillSymbol()
                color: [0, 0, 0, 0],
                outline: { // autocasts as new SimpleLineSymbol()
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
        ]) => {

            const graphic = new Graphic({
                geometry,
                symbol,
                attributes,
                // popupTemplate
            });

            hucsByStatusGraphicLayer.add(graphic);

        }).catch(err => {
            console.error(err);
        })

    };

    const removeHucGraphicByStatus = (hucID) => {
        // console.log('removeHucGraphicByStatus', hucID);
        hucsByStatusGraphicLayer.graphics.forEach(g => {
            if (g && g.attributes && g.attributes[config.FIELD_NAME.hucLayerHucID] === hucID) {
                hucsByStatusGraphicLayer.remove(g);
            }
        })
    };

    const addPreviewHucByID = async (hucID) => {
        const hucFeature = await queryHucsLayerByHucID(hucID);
        addPreviewHucGraphic(hucFeature)
    }

    const addPreviewHucGraphic = (feature) => {
        // const attributes = feature.attributes;
        console.log('addPreviewHucGraphic',feature, isInBatchSelectMode);
        if (!isInBatchSelectMode){
            cleanPreviewHucGraphic();
        }

        const symbol = {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: [0, 0, 0, 0],
            outline: { // autocasts as new SimpleLineSymbol()
                color: [84, 242, 242, 0.75],
                width: "2.5px"
            }
        };

        esriLoader.loadModules([
            "esri/Graphic",
        ], esriLoaderOptions).then(([
            Graphic
        ]) => {
            const graphicForSelectedHuc = new Graphic({
                geometry: feature.geometry,
                symbol: symbol,
            });

            hucPreviewGraphicLayer.add(graphicForSelectedHuc);
        });
    };

    const clearMapGraphics = (targetLayer = '') => {
        const layersLookup = {
            'hucPreview': hucPreviewGraphicLayer
        };

        if (layersLookup[targetLayer]) {
            layersLookup[targetLayer].removeAll();
        } else {
            clearAllGraphics();
        }
    }

    const clearAllGraphics = () => {
        hucsByStatusGraphicLayer.removeAll();
        cleanPreviewHucGraphic();
    };

    const cleanPreviewHucGraphic = () => {
        hucPreviewGraphicLayer.removeAll();
    };

    // highlight hucs from the species extent table
    const highlightHucs = (data) => {
        // cleanPreviewHucGraphic();
        //console.log('highlightingHucs!', data);
        clearAllGraphics();
        hucsLayer.renderer = getUniqueValueRenderer(data);
    };

    const getUniqueValueRenderer = (data) => {

        const defaultSymbol = {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: [0, 0, 0, 0],
            outline: { // autocasts as new SimpleLineSymbol()
                color: config.COLOR.hucBorder,
                width: "1px"
            }
        }

        const symbol = {
            type: "simple-fill", // autocasts as new SimpleFillSymbol()
            color: config.COLOR.hucFill,
            outline: { // autocasts as new SimpleLineSymbol()
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

        const uniqueValueInfos = data.map(d => {
            return {
                value: d[config.FIELD_NAME.speciesDistribution.hucID],
                symbol: symbol
            }
        });

        const renderer = {
            type: "unique-value", // autocasts as new UniqueValueRenderer()
            field: config.FIELD_NAME.hucLayerHucID,
            defaultSymbol: defaultSymbol, //{ type: "none" },  // autocasts as new SimpleFillSymbol()
            uniqueValueInfos: uniqueValueInfos
        };

        return renderer;
    };

    const initPredictedHabitatLayers = (mapView) => {
        // console.log(url);

        // if(actualModelBoundaryLayer){
        //     mapView.map.remove(actualModelBoundaryLayer);
        // }

        esriLoader.loadModules([
            "esri/layers/FeatureLayer",
        ], esriLoaderOptions).then(([
            FeatureLayer
        ]) => {

            const predictedHabitatLayers = [config.URL.PredictedHabitat.line, config.URL.PredictedHabitat.polygon].map(url => {

                return new FeatureLayer({
                    url,
                    opacity: .9,
                    listMode: 'hide',
                    definitionExpression: `cutecode=''`,
                    isPredictedHabitatLayer: true
                });
            });

            mapView.map.addMany(predictedHabitatLayers);

        });

        // mapView.map.reorder(actualModelBoundaryLayer, 0);

    };

    const showPredictedHabitatLayers = (speciesCode = '') => {
        mapView.map.layers.forEach(layer => {
            console.log(layer);

            if (layer.isPredictedHabitatLayer) {
                // console.log(la)

                layer.definitionExpression = `cutecode='${speciesCode}'`;
            }

            layer.refresh();

        });

        zoomToPredictedHabitatLayer();
    };

    const zoomToPredictedHabitatLayer = (speciesCode = '') => {
        mapView.map.layers.forEach(layer => {
            // console.log(layer);

            if (layer.isPredictedHabitatLayer) {
                // console.log(la)

                layer.queryExtent().then(function (results) {
                    // go to the extent of the results satisfying the query
                    // view.goTo(results.extent);

                    if (results.extent) {
                        mapView.goTo(results.extent);
                    }
                });
            }

        });
    };

    const setLayersOpacity = (val) => {
        mapView.map.layers.forEach(layer => {
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
        showPredictedHabitatLayers,
        getSelectState
    };

};

export default MapControl;