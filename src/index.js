import "./style/index.scss";

import "@babel/polyfill";

import config from './config';
import Controller from './core/Controller';
import View from './core/View';
import MapControl from './core/MapControl';
// import OAuthManager from './core/OauthManager';

(async function initApp(){

    // const oauthManager = new OAuthManager(config.oauthAppID);
    // const credential = await oauthManager.init();

    const view = new View();
    
    const mapControl = new MapControl({
        webMapID: config.webMapID,
        mapViewContainerID: config.DOM_ID.mapViewContainer,
    });

    const controller = new Controller({
        // mapControl,
        // view,
        // oauthManager,

        speciesDataOnReady:(data)=>{
            // console.log('speciesDataOnReady', data);
            view.speciesSelector.render(data);
        },
        legendDataOnReady:(data)=>{
            view.initLegend(data);
        },
        feedbackManagerOnOpen:(data)=>{
            view.toggleControlPanel({
                target: view.feedbackControlPanel,
                isVisible: true,
                data
            });
        },
        feedbackManagerOnClose:()=>{
            view.toggleControlPanel({
                target: view.feedbackControlPanel,
                isVisible: false
            });
        },
        speciesOnSelect:()=>{
            view.enableOpenOverallFeedbackBtnBtn();
        },


        onReviewMode:()=>{
            view.switchToReviewModeView();
            view.initViewComponentsForReviewMode();
        },
        overallFeedbackForReviewModeOnReady: (data=null)=>{
            view.openListView(view.listViewForOverallFeedback, data);
        },
        feedbackByUsersForReviewModeOnReady: (data=null)=>{
            view.openListView(view.listViewForDetailedFeedback, data);
        },
        feedbackByHucsForReviewModeOnReady: (data=null)=>{
            view.openListView(view.listViewForFeedbacksByHuc, data);
        },
        hucFeatureOnSelectForReviewMode:(feature)=>{
            if(view.listViewForDetailedFeedback.isVisible()){
                view.listViewForDetailedFeedback.setActiveRow(feature.attributes[config.FIELD_NAME.huc10LayerHucID]);
            } else {
                controller.getFeedbacksByHucForReviewMode(feature);
            }
        },
        

        highligtHucsOnMap:(data)=>{
            // console.log('highligtHucsOnMap', data);
            mapControl.highlightHucs(data);
        },
        addActualBoundaryLayerToMap:(url='')=>{
            // console.log('addActualBoundaryLayerToMap', url);
            mapControl.addActualModelBoundaryLayer(url);
        },
        clearMapGraphics:(targetLayer='')=>{
            // console.log('clearMapGraphics', targetLayer);
            mapControl.clearMapGraphics(targetLayer);
        },
        showHucFeatureOnMap:(hucID='', status)=>{
            // console.log('showHucFeatureOnMap', hucID);
            mapControl.showHucFeatureByStatus(hucID, status);
        },
        addPreviewHucByID:(hucID)=>{
            mapControl.addPreviewHucByID(hucID);
        },

        pdfUrlOnChange: (url='')=>{
            view.toggleDownloadAsPdfBtn(url);
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

    view.overallFeedbackControlPanel.init({
        containerID: config.DOM_ID.overallFeedbackControl,
        onCloseHandler: ()=>{
            // view.toggleOverallFeeback(false);

            view.toggleControlPanel({
                target: view.overallFeedbackControlPanel,
                isVisible: false
            });
        },
        onSubmitHandler: (data)=>{
            // console.log('submit overall feedback', data);
            // view.toggleOverallFeeback(false);

            view.toggleControlPanel({
                target: view.overallFeedbackControlPanel,
                isVisible: false
            });

            controller.postOverallFeedback(data);
        }
    });

    view.init({
        downloadPdfBtnOnClick: ()=>{
            controller.downloadPdf();
        },
        openOverallBtnOnclick: ()=>{
            // const data = controller.getOverallFeedback();
            // view.toggleOverallFeeback(true, data);
            view.toggleControlPanel({
                target: view.overallFeedbackControlPanel,
                isVisible: true,
                data: controller.getOverallFeedback()
            });
        },
        layerOpacitySliderOnUpdate: (val)=>{
            // console.log(val);
            mapControl.setLayersOpacity(val);
        },
        listViewForOverallFeedbackOnClick:(userID)=>{
            controller.getFeedbacksByUserForReviewMode(userID);
        },
        listViewForDetailedFeedbackOnClose:()=>{
            controller.renderListOfHucsWithFeedbacks();
        },
        listViewForDetailedFeedbackOnClick:(hucID)=>{
            mapControl.addPreviewHucByID(hucID);
        },
        listViewForFeedbacksByHucOnClose:()=>{
            controller.resetSelectedHucFeature();
        },
    });

    controller.init({
        // token: credential.token
    });

    // window.appDebugger = {
    //     signOut: oauthManager.signOut
    // };

})();