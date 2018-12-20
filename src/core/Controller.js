export default function Controller(options={}){

    const dataModel = options.dataModel || null;
    const mapControl = options.mapControl || null;
    const view = options.view || null;

    const init = ()=>{
        console.log('init app controller', dataModel, mapControl, view);
    };

    const querySpeciesLookupTable = ()=>{

    };

    const queryHucsBySpecies = ()=>{

    };

    return {
        init
    };

}