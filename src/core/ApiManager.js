import axios from 'axios';
import config from '../config';

const Promise = require('es6-promise').Promise;

export default function ApiManager(props={}){

    const querySpeciesLookupTable = ()=>{

        const requestUrl = config.URL.speciesLookupTable + '/query';

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params: {
                    // where: '1=1',
                    where: `ELEMENT_GLOBAL_ID = '137976' OR ELEMENT_GLOBAL_ID = '941975'`,
                    outFields: '*',
                    f: 'json',
                    token: props.oauthManager.getToken()
                }
            }).then(function (response) {
                // console.log(response);

                if(response.data && response.data.features && response.data.features.length){
                    // console.log(response.data.features);
                    resolve(response.data.features) 
                } else {
                    reject('no featurs in species lookup table');
                }
            }).catch(err=>{
                // console.error(err);
                reject(err);
            });
        });

    };

    const queryStatusTable = ()=>{
        const requestUrl = config.URL.statusTable + '/query';

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params: {
                    where: '1=1',
                    outFields: '*',
                    f: 'json',
                    token: props.oauthManager.getToken()
                }
            }).then(function (response) {
                // console.log(response);

                if(response.data && response.data.features && response.data.features.length){
                    // console.log(response.data.features);
                    resolve(response.data.features) 
                }
            }).catch(err=>{
                console.error(err);
            });
        });
    };

    const queryHucsBySpecies = (speciesKey)=>{
        // const requestUrl = config.URL.speciesExtent[speciesKey] ? config.URL.speciesExtent[speciesKey] + '/query' : null;

        const requestUrl = config.URL.speciesDistribution + '/query';
        const whereClause = `${config.FIELD_NAME.speciesDistribution.speciesCode} = '${speciesKey}'`;

        if(requestUrl){
            return new Promise((resolve, reject)=>{

                axios.get(requestUrl, {
                    params: {
                        where: whereClause,
                        outFields: '*',
                        f: 'json',
                        token: props.oauthManager.getToken()
                    }
                }).then(function (response) {
                    if(response.data && response.data.features && response.data.features.length){
                        // console.log(response.data.features);
                        resolve(response.data.features) 
                    } else {
                        reject('no huc features for selected species');
                    }
                }).catch(err=>{
                    console.error(err);
                });
            });

        } else {
            console.log('species extent table url is not found for', speciesKey);
        }
    };

    const fetchFeedback = (options={})=>{
        const requestUrl = options.requestUrl; //config.URL.feedbackTable + '/query';
        const whereClause = options.where || '1=1';
        const outFields = options.outFields || '*';
        const returnDistinctValues = options.returnDistinctValues || false;

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params: {
                    where: whereClause,
                    outFields,
                    returnDistinctValues,
                    f: 'json',
                    token: props.oauthManager.getToken()
                }
            }).then(function (response) {
                // console.log(response);

                if(response.data && response.data.features){
                    // console.log(response.data.features);
                    resolve(response.data.features);
                } else {
                    reject('no features found from the feedback table');
                }
            });
        });
    };

    const deleteFromFeedbackTable = (requestUrl, objectID)=>{
        // const requestUrl = config.URL.feedbackTable + '/deleteFeatures';

        const bodyFormData = new FormData();
        bodyFormData.append('objectIds', objectID); 
        bodyFormData.append('rollbackOnFailure', false); 
        bodyFormData.append('f', 'pjson'); 
        bodyFormData.append('token', props.oauthManager.getToken()); 

        return new Promise((resolve, reject)=>{

            axios.post(requestUrl, bodyFormData).then(function (response) {
                // console.log(response);
                resolve(response);
            }).catch(err=>{
                console.error(err);
                reject(err);
            });
        });
    }

    const applyEditToFeatureTable = (requestUrl, feature)=>{
        // const requestUrl = config.URL.feedbackTable + '/' + operationName;

        const bodyFormData = new FormData();
        bodyFormData.append('features', JSON.stringify(feature)); 
        bodyFormData.append('rollbackOnFailure', false); 
        bodyFormData.append('f', 'pjson'); 
        bodyFormData.append('token', props.oauthManager.getToken()); 

        return new Promise((resolve, reject)=>{

            axios.post(requestUrl, bodyFormData).then(function (response) {
                // console.log(response);
                resolve(response);
            }).catch(err=>{
                console.error(err);
                reject(err);
            });
        });
    };

    return {
        querySpeciesLookupTable,
        queryHucsBySpecies,
        queryStatusTable,
        fetchFeedback,
        deleteFromFeedbackTable,
        applyEditToFeatureTable
    }

};