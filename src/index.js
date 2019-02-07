import "./style/index.scss";

import config from './config';
import Controller from './core/Controller';
import View from './core/View';
import MapControl from './core/MapControl';
import OAuthManager from './core/OauthManager';

(function initApp(){

    const view = new View();
    
    const mapControl = new MapControl({
        webMapID: config.webMapID,
        mapViewContainerID: config.DOM_ID.mapViewContainer,
    });

    const oauthManager = new OAuthManager(config.oauthAppID);

    const controller = new Controller({
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
            token
        });

    }).catch(error=>{
        console.error(error);
    });


    window.appDebugger = {
        signOut: oauthManager.signOut
    };

})();