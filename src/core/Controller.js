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
        onOpenHandler: (data)=>{
            view.feedbackControlPanel.open(data);
            view.toggleMainControl(false);
        },
        onCloseHandler: ()=>{
            // console.log('feedbackManager is closed');
            view.feedbackControlPanel.close();
            view.toggleMainControl(true);
        },
        onSubmitHandler:(data)=>{
            // console.log('feedback manager onSubmitHandler', data);

            postFeedback(data);

            mapControl.toggleHucGraphicByStatus(data.hucID, data.status);

            resetSelectedHucFeature();
        }
    });

    const init = (options={})=>{
        // console.log('init app controller', dataModel, mapControl, view);

        token = options.token || null;

        initSpeciesLookupTable();

        initStatusTable();

        queryFeedbacksByUser();
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
                    // closeFeedbackManager();
                    // searchHucsBySpecies(val);
                    // dataModel.setSelectedSpecies(val);

                    setSelectedSpecies(val);
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

            view.feedbackControlPanel.setStatusData(data);

            initLegendForStatus(data);

        });
    };

    const initLegendForStatus = (data)=>{
        data = data.map((d, i)=>{
            return {
                label: d,
                color: config.COLOR['status' + i]
            };
        });

        view.initLegend(data);
        // console.log(data);
    };

    const searchHucsBySpecies = (speciesKey)=>{

        const hucsBySpecies = dataModel.getHucsBySpecies(speciesKey);

        if(hucsBySpecies){
            renderHucsBySpeciesDataOnMap(hucsBySpecies);
        } else {
            queryHucsBySpecies(speciesKey).then(data=>{

                data = data.map(d=>{
                    return d.attributes
                });
    
                dataModel.setHucsBySpecies(speciesKey, data);
    
                renderHucsBySpeciesDataOnMap();
            }).catch(err=>{
                console.log(err);
            })
        }

    };

    const renderHucsBySpeciesDataOnMap = (data)=>{
        const hucs = data || dataModel.getHucsBySpecies();
        mapControl.highlightHucs(hucs);

        renderHucWithFeedbackDataOnMap();
        // console.log('renderHucsBySpeciesDataOnMap', data);
    };

    const renderHucWithFeedbackDataOnMap = ()=>{
        const species = dataModel.getSelectedSpecies();
        const data = feedbackManager.getFeedbackDataBySpecies(species);

        // console.log(data); 

        Object.keys(data).forEach(function(key) {

            // console.log(key, data[key]);

            const hucID = data[key].hucID;
            const status = data[key].status;

            mapControl.toggleHucGraphicByStatus(hucID, status);
          
        });
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

    const queryFeedbacksByUser = ()=>{

        const userID = oauthManager.getUserID();

        fetchFeedback({
            where: `${config.FIELD_NAME.feedbackTable.userID} = '${userID}'`
        }).then(res=>{
            // console.log('previous feedbacks', res);

            const formattedFeedbackData = res.map(d=>{
                return {
                    userID: d.attributes[config.FIELD_NAME.feedbackTable.userID],
                    hucID: d.attributes[config.FIELD_NAME.feedbackTable.hucID],
                    species: d.attributes[config.FIELD_NAME.feedbackTable.species],
                    status: d.attributes[config.FIELD_NAME.feedbackTable.status],
                    comment: d.attributes[config.FIELD_NAME.feedbackTable.comment]
                }
            });

            feedbackManager.batchAddToDataStore(formattedFeedbackData);
        });
    };

    const fetchFeedback = (options={})=>{
        const requestUrl = config.URL.feedbackTable + '/query';
        const whereClause = options.where || '1=1';

        return new Promise((resolve, reject)=>{

            axios.get(requestUrl, {
                params: {
                    where: whereClause,
                    outFields: '*',
                    f: 'json',
                    token
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

    const postFeedback = (data={})=>{
        // console.log(data);

        const feedbackFeature = {
            "attributes": {
                [config.FIELD_NAME.feedbackTable.userID]: data.userID,
                [config.FIELD_NAME.feedbackTable.hucID]: data.hucID,
                [config.FIELD_NAME.feedbackTable.status]: data.status,
                [config.FIELD_NAME.feedbackTable.comment]: data.comment,
                [config.FIELD_NAME.feedbackTable.species]: data.species
            }
        };

        // query feedback table to see if such feature already exists, if so, call update feature operation, otherwise, call add feature operation
        fetchFeedback({
            where: `${config.FIELD_NAME.feedbackTable.userID} = '${data.userID}' AND ${config.FIELD_NAME.feedbackTable.species} = '${data.species}' AND ${config.FIELD_NAME.feedbackTable.hucID} = '${data.hucID}'`
        }).then(features=>{
            // console.log(features);

            let operationName = 'addFeatures';

            if(features[0]){
                feedbackFeature.attributes.ObjectId = features[0].attributes.ObjectId;
                operationName = 'updateFeatures';
            } 

            applyEditToFeedbackTable(feedbackFeature, operationName).then(res=>{
                console.log(operationName, res);
            });

        }).catch(err=>{
            console.error(err);

        })
    };

    const applyEditToFeedbackTable = (feature, operationName)=>{
        const requestUrl = config.URL.feedbackTable + '/' + operationName;

        const bodyFormData = new FormData();
        bodyFormData.append('features', JSON.stringify(feature)); 
        bodyFormData.append('rollbackOnFailure', false); 
        bodyFormData.append('f', 'pjson'); 
        bodyFormData.append('token', token); 

        return new Promise((resolve, reject)=>{

            axios.post(requestUrl, bodyFormData).then(function (response) {
                // console.log(response);
                resolve(response);
            });
        });
    };

    const setSelectedSpecies = (val)=>{
        dataModel.setSelectedSpecies(val);

        searchHucsBySpecies(val);

        resetSelectedHucFeature();
    };

    const setSelectedHucFeature = (feature=null)=>{

        selectedHucFeature = feature;

        if(selectedHucFeature){
            const hucID = selectedHucFeature.attributes[config.FIELD_NAME.huc10LayerHucID];
            dataModel.setSelectedHuc(hucID);

            // console.log(selectedHucFeature);

            openFeedbackManager();
        }
    };

    const resetSelectedHucFeature = ()=>{
        selectedHucFeature = null;

        dataModel.setSelectedHuc();

        mapControl.cleanPreviewHucGraphic();

        feedbackManager.close();
    };

    const openFeedbackManager = (options={})=>{
        const userID = oauthManager.getUserID();
        const species = dataModel.getSelectedSpecies();
        const hucID = dataModel.getSelectedHuc();
        const hucName = selectedHucFeature.attributes[config.FIELD_NAME.huc10LayerHucName];

        if(userID && species && hucID){
            feedbackManager.open({
                userID,
                species,
                hucID,
                hucName
            });
        } else {
            console.error('userID, species name and huc id are required to open the feedback manager...');
            resetSelectedHucFeature();
        }

    };

    return {
        init,
        dataModel,
        feedbackManager,
        setSelectedHucFeature,
        resetSelectedHucFeature
        // openFeedbackManager
    };

}