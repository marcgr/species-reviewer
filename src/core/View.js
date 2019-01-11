import config from '../config';

import SpeciesSelector from '../components/SpeciesSelector';
import FeedbackControlPanel from '../components/FeedbackControlPanel';

export default function View(){

    const speciesSelector = new SpeciesSelector();
    const feedbackControlPanel = new FeedbackControlPanel();
    const $mainControlPanel = document.getElementById(config.DOM_ID.mainControl);

    const init = ()=>{
        // feedbackControlPanel.init({
        //     containerID: config.DOM_ID.feedbackControl
        // });
    };

    const toggleMainControl = (isVisible)=>{
        if(isVisible){
            $mainControlPanel.classList.remove('hide');
        } else {
            $mainControlPanel.classList.add('hide');
        }
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
                const color = `rgb(${d.color.slice(0,3).join(',')})`;
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

    return {
        init,
        initLegend,
        speciesSelector,
        feedbackControlPanel,
        toggleMainControl
    };
};