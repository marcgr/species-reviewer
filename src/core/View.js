import config from '../config';

import SpeciesSelector from '../components/SpeciesSelector';
import FeedbackControlPanel from '../components/FeedbackControlPanel';
import OverallFeedbackControlPanel from '../components/OverallFeedbackControl';
import ListViewForOverallFeedback from '../components/ListViewForOverallFeedback';
import ListViewForDetailedFeedback from '../components/ListViewForDetailedFeedback';

export default function View(){

    let downloadPdfBtnOnClick = null;
    let openOverallBtnOnclick = null;
    let opacitySliderOnUpdate = null;

    const speciesSelector = new SpeciesSelector({
        containerID: config.DOM_ID.speciesSelector
    });

    const feedbackControlPanel = new FeedbackControlPanel();

    const overallFeedbackControlPanel = new OverallFeedbackControlPanel();

    const listViewForOverallFeedback = new ListViewForOverallFeedback({
        containerID: config.DOM_ID.listViewOverallFeedback
    });
    
    const listViewForDetailedFeedback = new ListViewForDetailedFeedback({
        containerID: config.DOM_ID.listViewDeatiledFeedback
    });

    const $mainControlPanel = document.getElementById(config.DOM_ID.mainControl);

    const init = (options={
        downloadPdfBtnOnClick: null,
        openOverallBtnOnclick: null,
        layerOpacitySliderOnUpdate: null
    })=>{
        // feedbackControlPanel.init({
        //     containerID: config.DOM_ID.feedbackControl
        // });

        downloadPdfBtnOnClick = options.downloadPdfBtnOnClick;
        openOverallBtnOnclick = options.openOverallBtnOnclick;
        opacitySliderOnUpdate = options.layerOpacitySliderOnUpdate;

        initEventHandlers();
    };

    const initEventHandlers = ()=>{
        document.querySelectorAll('.js-toggle-basemap-gallery').forEach(element=>{
            // console.log(element);
            element.addEventListener('click', toggleBasemapGallery);
        });

        document.querySelectorAll('.js-open-overall-feedback').forEach(element=>{
            // console.log('js-open-overall-feedback on click');
            element.addEventListener('click', openOverallBtnOnclick);
        });

        document.querySelectorAll('.js-download-pdf').forEach(element=>{
            element.addEventListener('click', downloadPdfBtnOnClick);
        });

        document.querySelectorAll('.js-toggle-ui-component').forEach(element=>{

            element.addEventListener('click', (evt)=>{
                const targetDomID = element.dataset.target;
                document.getElementById(targetDomID).classList.toggle('hide');
            });
        });

        document.querySelector('#sliderForLayerOpacity').addEventListener('change', (evt)=>{
            // console.log(evt.target.value);
            opacitySliderOnUpdate(evt.target.value);
        })
    };

    const toggleOverallFeeback = (isVisible=false, data={})=>{
        if(isVisible){
            overallFeedbackControlPanel.open(data);
        } else {
            overallFeedbackControlPanel.close();
        }
        
        toggleMainControl(!isVisible);
    };

    const toggleBasemapGallery = ()=>{
        // console.log('toggleBasemapGallery');
        document.getElementById('basemapGalleryControl').classList.toggle('is-collapsed');
    };

    const toggleMainControl = (isVisible)=>{
        if(isVisible){
            $mainControlPanel.classList.remove('hide');
        } else {
            $mainControlPanel.classList.add('hide');
        }
    };

    const toggleDownloadAsPdfBtn = (url)=>{
        const isActive = url ? true : false;
        document.getElementById('downloadPdfBtn').classList.toggle('is-active', isActive);
    };

    const enableOpenOverallFeedbackBtnBtn = (url)=>{
        document.getElementById('openOverallFeedbackBtn').classList.remove('btn-disabled');
    };

    const initLegend = (data)=>{
        const legend = new Legend({
            container: config.DOM_ID.legend
        });
        legend.init({
            data
        });
    };

    const Legend = function(options){

        let data = null;

        const container = options.container ? document.getElementById(options.container) : null;

        const init = (options)=>{

            if(!container){
                console.error('container is requird to init legend');
                return;
            }

            data = options.data || null;

            if(data){
                render();
            }
        };

        const render = ()=>{
            const componentHtml = data.map((d,i)=>{
                // const color = `rgb(${d.color.slice(0,3).join(',')})`;
                return `
                    <div class='trailer-quarter legend-item'>
                        <div class='inline-block legend-icon margin-right-half' data-index='${i}'></div>
                        <span class='font-size--2'>${d.label}</span>
                    </div>
                `;
                // return `
                //     <div class='trailer-quarter legend-item'>
                //         <div class='inline-block legend-icon margin-right-half' style='background-color:${color};'></div>
                //         <span class='font-size--2'>${d.label}</span>
                //     </div>
                // `;
            }).join('');

            container.innerHTML = componentHtml;
        };

        return {
            init
        };
        
    };

    const switchToReviewModeView = ()=>{
        document.getElementById('openOverallFeedbackBtnDiv').classList.add('hide');
    };

    // const openListViewForOverallFeedback = (data)=>{
    //     listViewForOverallFeedback.toggleVisibility(true);
    //     listViewForOverallFeedback.render(data);

    //     listViewForDetailedFeedback.toggleVisibility(false);
    // }

    // const openListViewForDetailedFeedback = (data)=>{
    //     listViewForOverallFeedback.toggleVisibility(false);
    //     listViewForDetailedFeedback.toggleVisibility(true);
    //     listViewForDetailedFeedback.render(data);
    // }

    const openListView = (targetListView, data)=>{
        [listViewForOverallFeedback, listViewForDetailedFeedback].forEach(item=>{
            if(item === targetListView){
                item.toggleVisibility(true);

                if(data){
                    item.render(data);
                }
                
            } else {
                item.toggleVisibility(false);
            }
        })
    };

    return {
        init,
        initLegend,
        speciesSelector,
        feedbackControlPanel,
        toggleMainControl,
        overallFeedbackControlPanel,
        toggleOverallFeeback,
        toggleDownloadAsPdfBtn,
        enableOpenOverallFeedbackBtnBtn,
        listViewForOverallFeedback,
        listViewForDetailedFeedback,
        switchToReviewModeView,
        // openListViewForDetailedFeedback,
        // openListViewForOverallFeedback,
        openListView
    };
};