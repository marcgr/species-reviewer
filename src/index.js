import "./style/index.scss";

import "@babel/polyfill";

import config from './config';
import Controller from './core/Controller';
import View from './core/View';
import MapControl from './core/MapControl';
import OAuthManager from './core/OauthManager';

(async function initApp(){

    const oauthManager = new OAuthManager(config.oauthAppID);
    const credential = await oauthManager.init();

    const view = new View();
    
    const mapControl = new MapControl({
        webMapID: config.webMapID,
        mapViewContainerID: config.DOM_ID.mapViewContainer,
    });

    const controller = new Controller({
        // mapControl,
        view,
        oauthManager,

        speciesDataOnReady:(data)=>{
            // console.log('speciesDataOnReady', data);
            view.speciesSelector.render(data);
        },
        legendDataOnReady:(data)=>{
            view.initLegend(data);
        },


        highligtHucsOnMap:(data)=>{
            mapControl.highlightHucs(data);
        },
        addActualBoundaryLayerToMap:(url='')=>{
            mapControl.addActualModelBoundaryLayer(url);
        },
        clearMapGraphics:(targetLayer='')=>{
            mapControl.clearMapGraphics(targetLayer);
        },
        showHucFeatureOnMap:(hucID='', status)=>{
            mapControl.showHucFeatureByStatus(hucID, status);
        },
        addPreviewHucByID:(hucID)=>{
            mapControl.addPreviewHucByID(hucID);
        }

    });

    mapControl.init({
        hucFeatureOnSelectHandler: (hucFeature)=>{
            // console.log('selected hucFeature', hucFeature);
            controller.setSelectedHucFeature(hucFeature);
        }
    });

    view.speciesSelector.init({
        onChange: (val)=>{
            // console.log(val);
            controller.setSelectedSpecies(val);
        }
    });

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

    view.init({
        downloadPdfBtnOnClick: ()=>{
            controller.downloadPdf();
        },
        openOverallBtnOnclick: ()=>{
            controller.openOverallFeedbackPanel();
        },
        layerOpacitySliderOnUpdate: (val)=>{
            // console.log(val);
            mapControl.setLayersOpacity(val);
        }
    });

    controller.init({
        // token: credential.token
    });

    window.appDebugger = {
        signOut: oauthManager.signOut
    };

})();