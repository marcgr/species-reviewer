import config from '../config';

import SpeciesSelector from '../components/SpeciesSelector';
import FeedbackControlPanel from '../components/FeedbackControlPanel';

export default function View(){

    const speciesSelector = new SpeciesSelector();
    const feedbackControlPanel = new FeedbackControlPanel();

    const init = ()=>{
        // feedbackControlPanel.init({
        //     containerID: config.DOM_ID.feedbackControl
        // });
    };

    return {
        init,
        speciesSelector,
        feedbackControlPanel
    };
};