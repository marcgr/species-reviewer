import config from '../config';

import SpeciesSelector from '../components/SpeciesSelector';

export default function View(){

    const speciesSelector = new SpeciesSelector();

    return {
        speciesSelector
    };
};