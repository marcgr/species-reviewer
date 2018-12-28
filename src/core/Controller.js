import axios from 'axios';

import FeedbackManager from '../core/FeedbackManager';
import config from '../config';

const Promise = require('es6-promise').Promise;

export default function Controller(options={}){

    let token = null;
    let selectedHucFeature = null;

    const dataModel = options.dataModel || null;
    const mapControl = options.mapControl || null;
    const view = options.view || null;
    const oauthManager = options.oauthManager || null;
    
    const feedbackManager = new FeedbackManager({
        onOpenHandler: ()=>{

        },
        onCloseHandler: ()=>{

        },
        onSubmitHandler:(data)=>{

        }
    });

    const init = (options={})=>{
        // console.log('init app controller', dataModel, mapControl, view);

        token = options.token || null;

        initSpeciesLookupTable();

        initStatusTable();
    };

    const initSpeciesLookupTable = ()=>{

        // console.log('init species lookup table');

        querySpeciesLookupTable().then(data=>{

            data = data.map(d=>{
                return d.attributes
            });
    
            dataModel.setSpeciesLookup(data);

            view.speciesSelector.init({
                containerID: config.DOM_ID.speciesSelector,
                data,
                onChange: (val)=>{
                    // console.log(val);
                    searchHucsBySpecies(val);
                    dataModel.setSelectedSpecies(val);
                }
            });

        });

    };

    const initStatusTable = ()=>{

        queryStatusTable().then(data=>{

            data = data.map(d=>{
                const lineBreakPattern = /(\r\n\t|\n|\r\t)/g;

                let statusType = d.attributes[config.FIELD_NAME.statusType];

                if(lineBreakPattern.test(statusType)){
                    statusType = statusType.replace(lineBreakPattern, ' ');
                }

                return statusType;
            });

            dataModel.setStatus(data);

        });
    };

    const searchHucsBySpecies = (speciesKey)=>{

        queryHucsBySpecies(speciesKey).then(data=>{

            data = data.map(d=>{
                return d.attributes
            });

            dataModel.setHucsBySpecies(data);

            mapControl.highlightHucs(data);

            console.log(data);
        })

    };

    const querySpeciesLookupTable = ()=>{

        const requestUrl = config.URL.speciesLookupTable + '/query';

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params: {
                    where: '1=1',
                    outFields: '*',
                    f: 'json',
                    token
                }
            }).then(function (response) {
                // console.log(response);

                if(response.data && response.data.features && response.data.features.length){
                    // console.log(response.data.features);
                    resolve(response.data.features) 
                }
            });
        });

    };

    const queryHucsBySpecies = (speciesKey)=>{
        const requestUrl = config.URL.speciesExtent[speciesKey] ? config.URL.speciesExtent[speciesKey] + '/query' : null;

        if(requestUrl){
            return new Promise((resolve, reject)=>{

                axios.get(requestUrl, {
                    params: {
                        where: '1=1',
                        outFields: '*',
                        f: 'json',
                        token
                    }
                }).then(function (response) {
                    if(response.data && response.data.features && response.data.features.length){
                        // console.log(response.data.features);
                        resolve(response.data.features) 
                    }
                });
            });

        } else {
            console.log('species extent table url is not found for', speciesKey);
        }
    };

    const queryStatusTable = ()=>{
        const requestUrl = config.URL.statusTable + '/query';

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params: {
                    where: '1=1',
                    outFields: '*',
                    f: 'json',
                    token
                }
            }).then(function (response) {
                // console.log(response);

                if(response.data && response.data.features && response.data.features.length){
                    // console.log(response.data.features);
                    resolve(response.data.features) 
                }
            });
        });
    };

    const setSelectedHucFeature = (feature=null)=>{

        selectedHucFeature = feature;

        if(selectedHucFeature){
            const hucID = selectedHucFeature.attributes[config.FIELD_NAME.huc10LayerHucID];
            dataModel.setSelectedHuc(hucID);

            openFeedbackManager();
        }
    };

    const openFeedbackManager = (options={})=>{
        const userID = oauthManager.getUserID();
        const species = dataModel.getSelectedSpecies();
        const hucID = dataModel.getSelectedHuc();

        feedbackManager.open({
            userID,
            species,
            hucID
        })
    };

    const closeFeedbackManager = ()=>{
        feedbackManager.close();

        dataModel.setSelectedSpecies();
        dataModel.setSelectedHuc();
    };

    return {
        init,
        feedbackManager,
        setSelectedHucFeature
        // openFeedbackManager
    };

}