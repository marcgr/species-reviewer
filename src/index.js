import "./style/index.scss";

import "@babel/polyfill";

import config from './config';
import Controller from './core/Controller';
import View from './core/View';
import MapControl from './core/MapControl';
import OAuthManager from './core/OauthManager';
import CsvLoader from './core/CsvLoader';

(async function initOAuthManager(){

    const oauthManager = new OAuthManager(config.oauthAppID, config.portalUrl);
    await oauthManager.init();

    document.querySelector('.js-accept-terms').addEventListener('click', evt=>{
        // console.log('agress');
        initApp(oauthManager);
    });
})();

const isReviewMode = window.location.search.indexOf('reviewMode=true') !== -1 ? true : false;

const initApp = async (oauthManager)=>{


    if(!oauthManager){
        console.error('oauth manager is required to init the app...');
        return;
    }

    const view = new View();

    const mapControl = new MapControl({
        portalUrl: config.portalUrl,
        webMapID: config.webMapID,
        mapViewContainerID: config.DOM_ID.mapViewContainer,
        isReviewMode: isReviewMode
    });

    const controller = new Controller({

        oauthManager,
        isReviewMode,

        speciesDataOnReady:(data)=>{
            // console.log('speciesDataOnReady', data);
            view.speciesSelector.render({ data });
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
            console.log('speciesOnSelect?')
            view.enableOpenOverallFeedbackBtnBtn();
        },
        onDeatiledFeedbackSubmit: (data)=>{
            // console.log('onDeatiledFeedbackSubmit', data);
            const species = data.species;
            view.speciesSelector.setSpeciesSelectorOptionAsReviewed(species, 'detailed');
        },
        onOverallFeedbackSubmit: (data)=>{
            // console.log('onOverallFeedbackSubmit', data);
            const species = data.attributes[config.FIELD_NAME.overallFeedback.species];
            view.speciesSelector.setSpeciesSelectorOptionAsReviewed(species, 'overall');
        },

        onReviewMode:()=>{
            view.switchToReviewModeView();
            view.initViewComponentsForReviewMode();
            document.getElementById('multiHucHelp').classList.add('hide');
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
                console.log('no view visible', feature);
                view.listViewForDetailedFeedback.setActiveRow(feature.attributes[config.FIELD_NAME.hucLayerHucID]);
            } else {
                console.log('getFeedbackBYHucForReviewMode sup!!', feature);
                controller.getFeedbacksByHucForReviewMode(feature);
            }
        },


        highligtHucsOnMap:(data)=>{
            console.log('highligtHucsOnMap', data);
            mapControl.highlightHucs(data);
        },
        // addActualBoundaryLayerToMap:(url='')=>{
        //     // console.log('addActualBoundaryLayerToMap', url);
        //     // mapControl.addActualModelBoundaryLayer(url);
        // },
        showToPredictedHabitatOnMap:(speciesCode='')=>{
            mapControl.showPredictedHabitatLayers(speciesCode);
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

    view.speciesSelector.init({
        onChange: (val)=>{
            // console.log(val);
            console.log('view.speicesSelector on Change?', val);
            controller.setSelectedSpecies(val);
            document.getElementById('selectHUCHelp').classList.remove('hide');
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
        signOutBtnOnClick:()=>{
            controller.signOut();
        }
    });

    controller.init({
        // token: credential.token
    });

    mapControl.init({
        hucFeatureOnSelectHandler: (hucFeature, selectState, select)=>{
            console.log('PEE selected hucFeature', mapControl.getSelectState());
            controller.setSelectedHucFeature(hucFeature, selectState, select);
        },
        zoomToHucFeatureHandler: (hucFeature)=>{
            console.log('zoom to huc feature', hucFeature)
            controller.zoomToHucFeature(hucFeature);
        }
    });

    const csvLoader = new CsvLoader({
        targetDomElementId: config.DOM_ID.mapViewContainer
    });
    csvLoader.init();

    // window.appDebugger = {
    //     signOut: oauthManager.signOut
    // };

};