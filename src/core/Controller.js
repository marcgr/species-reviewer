import axios from 'axios';

import config from '../config';

const Promise = require('es6-promise').Promise;

export default function Controller(options={}){

    let token = null;

    const dataModel = options.dataModel || null;
    const mapControl = options.mapControl || null;
    const view = options.view || null;

    const init = (options={})=>{
        // console.log('init app controller', dataModel, mapControl, view);

        token = options.token || null;

        initSpeciesLookupTable();
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
                }
            });

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

    return {
        init
    };

}