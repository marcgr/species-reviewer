import axios from 'axios';

import DataModel from './DataModel';
import DataModelForReviewMode from './DataModelForReviewMode';
import FeedbackManager from './FeedbackManager';
import config from '../config';

const Promise = require('es6-promise').Promise;

export default function Controller(options={}){

    let token = null;
    let selectedHucFeature = null;
    let isReviewMode = window.location.search.indexOf('reviewMode=true') !== -1 ? true : false;

    const dataModel = new DataModel();
    const dataModelForReviewMode = new DataModelForReviewMode();
    const mapControl = options.mapControl || null;
    const view = options.view || null;
    const oauthManager = options.oauthManager || null;
    
    const feedbackManager = new FeedbackManager({
        onOpenHandler: (data)=>{
            view.feedbackControlPanel.open(data);
            view.toggleMainControl(false);
            // console.log('feedbackManager onOpenHandler', data);
        },
        onCloseHandler: ()=>{
            // console.log('feedbackManager is closed');
            view.feedbackControlPanel.close();
            view.toggleMainControl(true);
        },
        onSubmitHandler:(data)=>{
            // console.log('feedback manager onSubmitHandler', data);

            postFeedback(data);

            showHucFeatureOnMap(data.hucID, data.status, data);

            resetSelectedHucFeature();
        },
        onRemoveHandler: (data)=>{
            // console.log('feedback manager onRemoveHandler', data);

            deleteFeedback(data);

            showHucFeatureOnMap(data.hucID);

            resetSelectedHucFeature();
        }
    });

    const init = (options={})=>{
        // console.log('init app controller', dataModel, mapControl, view);

        if(isReviewMode){
            initReviewMode();
        }

        token = options.token || null;

        initSpeciesLookupTable();

        initStatusTable();

        queryFeedbacksByUser();

        queryOverallFeedbacksByUser();
    };

    const initReviewMode = ()=>{

        mapControl.disableMapOnHoldEvent();

        view.switchToReviewModeView();

        view.listViewForOverallFeedback.init({
            onClickHandler:(userID)=>{
                // console.log(val);
                reviewFeedbacksByUser(userID);
            }
        });

        view.listViewForDetailedFeedback.init({
            onCloseHandler:()=>{
                // mapControl.clearAllGraphics();
                view.openListView(view.listViewForOverallFeedback);

                renderListOfHucsWithFeedbacks();
            },
            onClickHandler:(hucID)=>{
                // console.log(hucID);
                mapControl.queryHucsLayerByHucID(hucID).then(mapControl.addPreviewHucGraphic);
            }
        })
    };

    const initSpeciesLookupTable = ()=>{

        // console.log('init species lookup table');

        querySpeciesLookupTable().then(data=>{

            data = data.map(d=>{
                return d.attributes
            });
    
            dataModel.setSpeciesLookup(data);

            // view.speciesSelector.init({
            //     containerID: config.DOM_ID.speciesSelector,
            //     data,
            //     onChange: (val)=>{

            //         dataModel.setSelectedSpecies(val);

            //         speciesOnSelectHandler(val);

            //         if(isReviewMode){
            //             reviewOverallFeedbacksBySpecies();
            //         } else {
            //             view.enableOpenOverallFeedbackBtnBtn();
            //         }

            //     }
            // });

            initSpeciesSelector(data);

        }).catch(err=>{
            console.error(err);
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

            // console.log(data);

            dataModel.setStatus(data);

            view.feedbackControlPanel.setStatusData(data);

            initLegendForStatus(data);

        }).catch(error=>{
            console.error(error);
        });
    };

    const initLegendForStatus = (data)=>{
        data = data.map((d, i)=>{
            return {
                label: d,
                // color: config.COLOR['status' + i]
            };
        });

        data.unshift({
            label: 'Actual Extent',
            // color: config.COLOR.actualModeledExtent
        });

        view.initLegend(data);
        
    };

    const searchHucsBySpecies = (speciesKey)=>{

        const hucsBySpecies = dataModel.getHucsBySpecies(speciesKey);

        if(hucsBySpecies){
            renderHucsBySpeciesDataOnMap({
                data: hucsBySpecies,
                speciesKey
            });
        } else {
            queryHucsBySpecies(speciesKey).then(data=>{

                data = data.map(d=>{
                    return d.attributes
                });
    
                dataModel.setHucsBySpecies(speciesKey, data);
    
                renderHucsBySpeciesDataOnMap({
                    speciesKey
                });
            }).catch(err=>{
                console.log(err);
            })
        }

    };

    const renderHucsBySpeciesDataOnMap = (options={
        data: null,
        speciesKey: ''
    })=>{
        const hucs = options.data || dataModel.getHucsBySpecies();

        if(options.speciesKey){
            const actualBoundaryLayerUrl = config.URL.speciesActualBoundaries[options.speciesKey];
            mapControl.addActualModelBoundaryLayer(actualBoundaryLayerUrl);
        }
        
        mapControl.highlightHucs(hucs);

        if(!isReviewMode){
            renderHucWithFeedbackDataOnMap();
        }
    };

    const renderHucWithFeedbackDataOnMap = (data)=>{
        const species = dataModel.getSelectedSpecies();
        data = data || feedbackManager.getFeedbackDataBySpecies(species);

        // console.log(data); 

        Object.keys(data).forEach(function(key) {

            // console.log(key, data[key]);

            const hucID = data[key].hucID;
            const status = data[key].status;

            showHucFeatureOnMap(hucID, status, data[key]);
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
            }).catch(err=>{
                console.error(err);
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
                }).catch(err=>{
                    console.error(err);
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
            }).catch(err=>{
                console.error(err);
            });
        });
    };

    const queryFeedbacksByUser = (options={
        userID: '', 
        species: '',
        onSuccessHandler: null
    })=>{

        const userID = options.userID || oauthManager.getUserID();
        const onSuccessHandler = options.onSuccessHandler;
        const whereClauseParts = [`${config.FIELD_NAME.feedbackTable.userID} = '${userID}'`];

        if(options.species){
            whereClauseParts.push(`${config.FIELD_NAME.feedbackTable.species} = '${options.species}'`)
        }

        fetchFeedback({
            requestUrl: config.URL.feedbackTable + '/query',
            where: whereClauseParts.join(' AND ')
        }).then(res=>{
            // console.log('previous feedbacks from', userID, res);

            const formattedFeedbackData = res.map(d=>{
                return {
                    userID: d.attributes[config.FIELD_NAME.feedbackTable.userID],
                    hucID: d.attributes[config.FIELD_NAME.feedbackTable.hucID],
                    species: d.attributes[config.FIELD_NAME.feedbackTable.species],
                    status: d.attributes[config.FIELD_NAME.feedbackTable.status],
                    comment: d.attributes[config.FIELD_NAME.feedbackTable.comment]
                }
            });

            if(onSuccessHandler){
                onSuccessHandler(formattedFeedbackData);
            } else {
                feedbackManager.batchAddToDataStore(formattedFeedbackData);
            }
            
        }).catch(err=>{
            console.error(err);
        });
    };

    const reviewOverallFeedbacksBySpecies = ()=>{

        const species = dataModel.getSelectedSpecies();

        fetchFeedback({
            requestUrl: config.URL.overallFeedback + '/query',
            where: `${config.FIELD_NAME.overallFeedback.species} = '${species}'`
        }).then(res=>{
            console.log('previous overall feedbacks by species', res);

            // view.listViewForOverallFeedback.render(res);

            view.openListView(view.listViewForOverallFeedback, res);

        });
    }; 

    const reviewFeedbacksByUser = (userID='')=>{

        queryFeedbacksByUser({
            userID,
            species: dataModel.getSelectedSpecies(),
            onSuccessHandler: (data)=>{

                mapControl.clearAllGraphics();

                data.forEach(d=>{
                    // console.log(d);
                    showHucFeatureOnMap(d.hucID, d.status, d);
                });

                view.openListView(view.listViewForDetailedFeedback, data);

                // console.log(data);
            }
        })
    }

    const queryOverallFeedbacksByUser = ()=>{

        const userID = oauthManager.getUserID();

        fetchFeedback({
            requestUrl: config.URL.overallFeedback + '/query',
            where: `${config.FIELD_NAME.overallFeedback.userID} = '${userID}'`
        }).then(res=>{
            // console.log('previous overall feedbacks', res);

            saveOverallFeedbackToDataModel(res);

            // dataModel.setOverallFeedback(res);

            // const rating = res[0] && res[0].attributes && res[0].attributes[config.FIELD_NAME.overallFeedback.rating] ? res[0].attributes[config.FIELD_NAME.overallFeedback.rating] : 0;
            // const comment = res[0] && res[0].attributes && res[0].attributes[config.FIELD_NAME.overallFeedback.comment] ? res[0].attributes[config.FIELD_NAME.overallFeedback.comment] : 0;

            view.overallFeedbackControlPanel.init({
                containerID: config.DOM_ID.overallFeedbackControl,
                // rating,
                // comment,
                onCloseHandler: ()=>{
                    view.toggleOverallFeeback(false);
                },
                onSubmitHandler: (data)=>{
                    // console.log('submit overall feedback', data);
                    view.toggleOverallFeeback(false);
                    postOverallFeedback(data);
                }
            }).catch(err=>{
                console.error(err);
            });

        });
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

    const deleteFeedback = (data={})=>{
        // // query feedback table to see if such feature already exists, if so, call update feature operation, otherwise, call add feature operation
        fetchFeedback({
            requestUrl: config.URL.feedbackTable + '/query',
            where: `${config.FIELD_NAME.feedbackTable.userID} = '${data.userID}' AND ${config.FIELD_NAME.feedbackTable.species} = '${data.species}' AND ${config.FIELD_NAME.feedbackTable.hucID} = '${data.hucID}'`
        }).then(features=>{
            // console.log('found feature to delete', features);

            if(features[0]){
                const requestUrl = config.URL.feedbackTable + '/deleteFeatures';
                const objectID = features[0].attributes.ObjectId;

                deleteFromFeedbackTable(requestUrl, objectID).then(res=>{
                    // console.log('deleted from feedback table', res);
                });
            } 
        }).catch(err=>{
            console.error(err);
        });
    };

    const postOverallFeedback = (data={
        rating: 0,
        comment: ''
    })=>{
        const userID = oauthManager.getUserID();
        const species = dataModel.getSelectedSpecies();

        const feature = {
            "attributes": {
                [config.FIELD_NAME.overallFeedback.userID]: userID,
                [config.FIELD_NAME.overallFeedback.species]: species,
                [config.FIELD_NAME.overallFeedback.rating]: data.rating,
                [config.FIELD_NAME.overallFeedback.comment]: data.comment,
            }
        };

        saveOverallFeedbackToDataModel([feature]);

        fetchFeedback({
            requestUrl: config.URL.overallFeedback + '/query',
            where: `${config.FIELD_NAME.overallFeedback.userID} = '${userID}' AND ${config.FIELD_NAME.overallFeedback.species} = '${species}'`
        }).then(features=>{
            // console.log(features);

            const requestUrl = features[0] ? config.URL.overallFeedback + '/updateFeatures' : config.URL.overallFeedback + '/addFeatures' ;
            // let operationName = 'addFeatures';

            if(features[0]){
                feature.attributes.ObjectId = features[0].attributes.ObjectId;
            } 

            applyEditToFeatureTable(requestUrl, feature).then(res=>{
                // console.log('post edit to OverallFeedback table', res);
            });
        }).catch(err=>{
            console.error(err);
        });
    }

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
            requestUrl: config.URL.feedbackTable + '/query',
            where: `${config.FIELD_NAME.feedbackTable.userID} = '${data.userID}' AND ${config.FIELD_NAME.feedbackTable.species} = '${data.species}' AND ${config.FIELD_NAME.feedbackTable.hucID} = '${data.hucID}'`
        }).then(features=>{
            // console.log(features);

            let requestUrl = features[0] ? config.URL.feedbackTable + '/updateFeatures' : config.URL.feedbackTable + '/addFeatures' ;
            // let operationName = 'addFeatures';

            if(features[0]){
                feedbackFeature.attributes.ObjectId = features[0].attributes.ObjectId;
            } 

            applyEditToFeatureTable(requestUrl, feedbackFeature).then(res=>{
                // console.log(applyEditToFeatureTable, res);
            });

        }).catch(err=>{
            console.error(err);

        })
    };

    const deleteFromFeedbackTable = (requestUrl, objectID)=>{
        // const requestUrl = config.URL.feedbackTable + '/deleteFeatures';

        const bodyFormData = new FormData();
        bodyFormData.append('objectIds', objectID); 
        bodyFormData.append('rollbackOnFailure', false); 
        bodyFormData.append('f', 'pjson'); 
        bodyFormData.append('token', token); 

        return new Promise((resolve, reject)=>{

            axios.post(requestUrl, bodyFormData).then(function (response) {
                // console.log(response);
                resolve(response);
            }).catch(err=>{
                console.error(err);
            });
        });
    }

    const applyEditToFeatureTable = (requestUrl, feature)=>{
        // const requestUrl = config.URL.feedbackTable + '/' + operationName;

        const bodyFormData = new FormData();
        bodyFormData.append('features', JSON.stringify(feature)); 
        bodyFormData.append('rollbackOnFailure', false); 
        bodyFormData.append('f', 'pjson'); 
        bodyFormData.append('token', token); 

        return new Promise((resolve, reject)=>{

            axios.post(requestUrl, bodyFormData).then(function (response) {
                // console.log(response);
                resolve(response);
            }).catch(err=>{
                console.error(err);
            });
        });
    };

    const speciesOnSelectHandler = (val)=>{
        // dataModel.setSelectedSpecies(val);

        searchHucsBySpecies(val);

        resetSelectedHucFeature();

        view.toggleDownloadAsPdfBtn(getPdfUrlForSelectedSpecies());
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
        const isHucInModeledRange = dataModel.isHucInModeledRange(hucID, species);

        // console.log('isHucInModeledRange', isHucInModeledRange);

        if(userID && species && hucID){
            feedbackManager.open({
                userID,
                species,
                hucID,
                hucName,
                isHucInModeledRange
            });
        } else {
            console.error('userID, species name and huc id are required to open the feedback manager...');
            resetSelectedHucFeature();
        }

    };

    const getPdfUrlForSelectedSpecies = ()=>{
        const species = dataModel.getSelectedSpecies();
        const url = config.URL.pdf[species];
        return url;
    }

    const downloadPdf = ()=>{
        // console.log('controller: download pdf');

        const url = getPdfUrlForSelectedSpecies();

        if(url){
            window.open(url);
        } else {
            console.error('no pdf file is found for selected species', species);
        }
    };

    const openOverallFeedbackPanel = ()=>{
        const species = dataModel.getSelectedSpecies();

        const prevFeedbackData = dataModel.getOverallFeedback(species);

        // console.log(prevFeedbackData);

        const data = prevFeedbackData 
        ? {
            rating: prevFeedbackData[config.FIELD_NAME.overallFeedback.rating],
            comment: prevFeedbackData[config.FIELD_NAME.overallFeedback.comment],
        }
        : {};

        view.toggleOverallFeeback(true, data);
    };

    const saveOverallFeedbackToDataModel = (features)=>{
        // const data = {};

        features.forEach(feature=>{
            const key = feature.attributes[config.FIELD_NAME.overallFeedback.species];

            const val = {
                [config.FIELD_NAME.overallFeedback.rating]: feature.attributes[config.FIELD_NAME.overallFeedback.rating],
                [config.FIELD_NAME.overallFeedback.comment]: feature.attributes[config.FIELD_NAME.overallFeedback.comment],
            };

            dataModel.saveToOverallFeedback(key, val);
        });

        // console.log(data);
    };

    const initSpeciesSelector = (data)=>{
        view.speciesSelector.init({
            containerID: config.DOM_ID.speciesSelector,
            data,
            onChange: (val)=>{

                dataModel.setSelectedSpecies(val);

                speciesOnSelectHandler(val);

                if(isReviewMode){
                    reviewOverallFeedbacksBySpecies();
                    getListOfHucsWithFeedbacks();
                } else {
                    view.enableOpenOverallFeedbackBtnBtn();
                }

            }
        });

    };

    const getListOfHucsWithFeedbacks = ()=>{
        const species = dataModel.getSelectedSpecies();

        if(dataModelForReviewMode.getHucsWithFeedbacks(species)){
            renderListOfHucsWithFeedbacks();
        } else {
            fetchFeedback({
                requestUrl: config.URL.feedbackTable + '/query',
                where: `${config.FIELD_NAME.feedbackTable.species} = '${species}'`,
                outFields: `${config.FIELD_NAME.feedbackTable.hucID}, ${config.FIELD_NAME.feedbackTable.status}`,
                returnDistinctValues: true
            }).then(res=>{
                // console.log('getListOfHucsWithFeedbacks', res);
                dataModelForReviewMode.setHucsWithFeedbacks(species, res);
                renderListOfHucsWithFeedbacks();
            });
        }
    };

    const renderListOfHucsWithFeedbacks = ()=>{
        const species = dataModel.getSelectedSpecies();
        const features = dataModelForReviewMode.getHucsWithFeedbacks(species);

        mapControl.clearAllGraphics();

        features.forEach(feature=>{
            showHucFeatureOnMap(feature.attributes[config.FIELD_NAME.feedbackTable.hucID], feature.attributes[config.FIELD_NAME.feedbackTable.status]);
        });
    };

    const showHucFeatureOnMap = (hucID='', status=0, data=null)=>{
        if(!hucID){
            console.error('hucID is missing...');
            return
        }

        const options = data ? getHucFeatureOptions(data) : {};

        mapControl.showHucFeatureByStatus(hucID, status, options);
    };

    const getHucFeatureOptions = (data)=>{
        // console.log(data);
        return {
            attributes: {
                "hucID": data.hucID,
                "status": data.status === 1 ? 'Add' : 'Remove',
                "comment": data.comment
            },
            popupTemplate: {
                title: "Feedback for {NAME}",
                content: [
                    {
                        type: "fields",
                        fieldInfos: [
                            {
                                fieldName: "NAME",
                                label: "NAME",
                                visible: false
                            },
                            {
                                fieldName: "hucID",
                                label: "HUCID",
                                visible: true
                            },
                            {
                                fieldName: "status",
                                label: "Action",
                                visible: true
                            },
                            {
                                fieldName: "comment",
                                label: "Comment",
                                visible: true
                            },
                        ]
                    }
                ]
            }
        }
    };

    return {
        init,
        dataModel,
        feedbackManager,
        setSelectedHucFeature,
        resetSelectedHucFeature,
        downloadPdf,
        openOverallFeedbackPanel
        // openFeedbackManager
    };

}