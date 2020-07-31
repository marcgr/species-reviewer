import axios from 'axios';
import config from '../config';

const Promise = require('es6-promise').Promise;

export default function ApiManager(props={}){

    const querySpeciesByUser = (options={
        email: ''
    })=>{
        const requestUrl = config.URL.speciesByUser + '/query';
        const whereClause = `${config.FIELD_NAME.speciesByUser.email} = '${options.email}'`

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params: {
                    where: whereClause,
                    outFields: '*',
                    f: 'json',
                    token: props.oauthManager.getToken()
                }
            }).then(function (response) {
                // console.log(response);

                if(response.data && response.data.features){
                    // console.log(response.data.features);
                    resolve(response.data.features);
                }
            }).catch(err=>{
                // console.error(err);
                reject(err);
            });
        });
    }

    const querySpeciesLookupTable = (options={
        speciesCode: []
    })=>{

        const requestUrl = config.URL.speciesLookupTable + '/query';

        const whereClause = options.speciesCode.map(d=>{
            return `${config.FIELD_NAME.speciesLookup.speciesCode} = '${d}'`;
        }).join(' OR ');

        console.log('where clause for species lookup', whereClause,options.speciesCode)

        return new Promise((resolve, reject)=>{

            const bodyFormData = new FormData();
            bodyFormData.append('where', whereClause);
            bodyFormData.append('outFields', '*');
            bodyFormData.append('f', 'json');
            bodyFormData.append('token', props.oauthManager.getToken());

            axios.post(requestUrl, bodyFormData).then(function (response) {
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

    const queryAllFeaturesFromSpeciesLookupTable = ()=>{
        const requestUrl = config.URL.speciesLookupTable + '/query';

        return new Promise((resolve, reject)=>{

            // const bodyFormData = new FormData();
            // bodyFormData.append('where', '1=1');
            // bodyFormData.append('outFields', '*');
            // bodyFormData.append('f', 'json');
            // bodyFormData.append('token', props.oauthManager.getToken());

            // axios.post(requestUrl, bodyFormData).then(function (response) {
            //     // console.log(response);

            //     if(response.data && response.data.features && response.data.features.length){
            //         // console.log(response.data.features);
            //         resolve(response.data.features)
            //     } else {
            //         reject('no featurs in species lookup table');
            //     }
            // }).catch(err=>{
            //     // console.error(err);
            //     reject(err);
            // });

            let arrOfAllFeatures = [];

            const getFeatures = (resultOffset)=>{

                const bodyFormData = new FormData();
                bodyFormData.append('where', '1=1');
                bodyFormData.append('outFields', '*');
                bodyFormData.append('f', 'json');
                bodyFormData.append('token', props.oauthManager.getToken());

                if(resultOffset){
                    bodyFormData.append('resultOffset', resultOffset);
                }

                axios.post(requestUrl, bodyFormData).then(function (response) {
                    // console.log(response);

                    if(response.data && response.data.features && response.data.features.length){
                        // console.log(response.data.features);
                        arrOfAllFeatures = [...arrOfAllFeatures, ...response.data.features];
                    }

                    if(response.data.exceededTransferLimit){
                        getFeatures(response.data.features[response.data.features.length - 1].attributes.objectid);
                    } else {
                        resolve(arrOfAllFeatures)
                    }

                }).catch(err=>{
                    // console.error(err);
                    reject(err);
                });
            };

            getFeatures();
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
                console.log('status table response?', response);

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
                    console.log('queryingHucsBySpecies reponse', response);
                    if(response.data && response.data.features && response.data.features.length){
                        console.log('species has hucs',response.data.features);
                        resolve(response.data.features)
                    } else {
                        reject('no huc features for selected species');
                    }
                }).catch(err=>{
                    console.log('error queryingHucsBySpecies', err);
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
        console.log('fetchFeedbakc chump', options.requestUrl);

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
                 console.log('fetchFeedback reponse',response);

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
        const featureArr = "[" + JSON.stringify(feature) + "]";
        const bodyFormData = new FormData();
        bodyFormData.append('features', featureArr);
        bodyFormData.append('rollbackOnFailure', false);
        bodyFormData.append('f', 'pjson');
        bodyFormData.append('token', props.oauthManager.getToken());
        console.log('post to featuretable?', JSON.stringify(feature));

        return new Promise((resolve, reject)=>{

            axios.post(requestUrl, bodyFormData).then(function (response) {
                console.log('post to feature table response',response);
                resolve(response);
            }).catch(err=>{
                console.error('post to feature table error',err);
                reject(err);
            });
        });
    };

    const queryPdfTable = (speciesKey='')=>{

        const requestUrl = config.URL.pdfLookup + '/query';
        const whereClause = `${config.FIELD_NAME.pdfLookup.speciesCode} = '${speciesKey}'`;

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
                        reject('no PDF resouce found for selected species');
                    }
                }).catch(err=>{
                    console.error(err);
                });
            });

        } else {
            console.log('pdf lookup table url is not found for', speciesKey);
        }
    };

    const getDistinctSpeciesCodeFromModelingExtent = ()=>{
        const requestUrl = config.URL.speciesDistribution + '/query';

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params: {
                    where: '1=1',
                    outFields: config.FIELD_NAME.speciesDistribution.speciesCode,
                    returnDistinctValues: true,
                    f: 'json',
                    token: props.oauthManager.getToken()
                }
            }).then(function (response) {
                if(response.data && response.data.features){
                    //console.log(response.data.features);

                    const speciesCodes = response.data.features.map(d=>{
                        return d.attributes[config.FIELD_NAME.speciesDistribution.speciesCode]
                    });
                    resolve(speciesCodes)
                } else {
                    reject('no distinct species from modeling extent.  Check species distribution service.');
                }
            }).catch(err=>{
                reject(err);
            });
        });
    };

    const getDataLoadDate = (speciesCode='')=>{

        const fieldNameDataLoadDate = config.FIELD_NAME.data_load_date.data_load_date
        const requestUrl = config.URL.data_load_date + '/query';
        const where = `${config.FIELD_NAME.data_load_date.species_code} = '${speciesCode}'`

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params: {
                    where,
                    outFields: fieldNameDataLoadDate,
                    f: 'json',
                    token: props.oauthManager.getToken()
                }
            }).then(function (response) {
                if(response.data && response.data.features){
                    // console.log(response.data.features);

                    const dataLoadDate = response.data.features && response.data.features[0] ? response.data.features[0].attributes[fieldNameDataLoadDate] : '';

                    resolve(dataLoadDate)
                } else {
                    reject('no data load date is found');
                }
            }).catch(err=>{
                reject(err);
            });
        });
    };

    return {
        querySpeciesLookupTable,
        queryAllFeaturesFromSpeciesLookupTable,
        queryHucsBySpecies,
        queryStatusTable,
        fetchFeedback,
        deleteFromFeedbackTable,
        applyEditToFeatureTable,
        querySpeciesByUser,
        queryPdfTable,
        getDistinctSpeciesCodeFromModelingExtent,
        getDataLoadDate
    }

};