"use strict";

import DataModel from "./DataModel";
import DataModelForReviewMode from "./DataModelForReviewMode";
import FeedbackManager from "./FeedbackManager";
import config from "../config";
import OAuthManager from "./OauthManager";
import ApiManager from "./ApiManager";

export default function Controller(props = {}) {
  // const oauthManager = new OAuthManager(config.oauthAppID);
  const oauthManager = props.oauthManager;
  const dataModel = new DataModel();
  const dataModelForReviewMode = new DataModelForReviewMode();
  const feedbackManager = new FeedbackManager();
  const apiManager = new ApiManager({ oauthManager });

  const controllerProps = props;

  const state = {
    selectedHucFeature: null
  };
  const isReviewMode =
    window.location.search.indexOf("reviewMode=true") !== -1 ? true : false;

  const init = async () => {
    // console.log('init app controller');

    if (isReviewMode) {
      // initReviewMode();
      controllerProps.onReviewMode();
    }

    try {
      // const portalUser = await oauthManager.init();

      const portalUser = oauthManager.getPoralUser();

      const speciesByUsers = await apiManager.querySpeciesByUser({
        email: portalUser.email
      });

      const sepeciesData =
        portalUser.username === "MobiAdmin8"
          ? await apiManager.queryAllFeaturesFromSpeciesLookupTable()
          : await apiManager.querySpeciesLookupTable({
              speciesCode: getDistinctSpeciesCodeToReview(speciesByUsers)
            });
      // console.log(sepeciesData);

      const statusData = await apiManager.queryStatusTable();
      initStatusTable(statusData);

      initFeedbackManager();

      const deatiledFeedbacks = await queryFeedbacksByUser();

      const overallFeedbacks = await queryOverallFeedbacksByUser();

      initSpeciesLookupTable(sepeciesData, deatiledFeedbacks, overallFeedbacks);

      // console.log(deatiledFeedbacks, overallFeedbacks);
    } catch (err) {
      console.error(err);
    }
  };

  const initFeedbackManager = () => {
    feedbackManager.init({
      onOpenHandler: data => {
        // console.log('feedbackManager onOpenHandler', data);
        controllerProps.feedbackManagerOnOpen(data);
      },

      onCloseHandler: () => {
        // console.log('feedbackManager is closed');
        controllerProps.feedbackManagerOnClose();
      },

      onSubmitHandler: data => {
        // console.log('feedback manager onSubmitHandler', data);
        postFeedback(data);
        showHucFeatureOnMap(data.hucID, data.status, data);
        resetSelectedHucFeature();

        controllerProps.onDeatiledFeedbackSubmit(data);
      },

      onRemoveHandler: data => {
        // console.log('feedback manager onRemoveHandler', data);
        deleteFeedback(data);
        showHucFeatureOnMap(data.hucID);
        resetSelectedHucFeature();
      }
    });
  };

  const initSpeciesLookupTable = async (
    data,
    deatiledFeedbacks,
    overallFeedbacks
  ) => {
    const speciesWithDataLoaded = await apiManager.getDistinctSpeciesCodeFromModelingExtent();
    // console.log(speciesWithDataLoaded)

    const speciesWithOverallFeedback = {};
    const speciesWithDeatiledFeedback = {};

    deatiledFeedbacks.forEach(d => {
      const species = d.attributes[config.FIELD_NAME.feedbackTable.species];
      speciesWithDeatiledFeedback[species] = true;
    });

    overallFeedbacks.forEach(d => {
      const species = d.attributes[config.FIELD_NAME.overallFeedback.species];

      if (+d.attributes[config.FIELD_NAME.overallFeedback.rating]) {
        speciesWithOverallFeedback[species] = true;
      }
    });

    data = data.map(d => {
      const species = d.attributes[config.FIELD_NAME.speciesLookup.speciesCode];
      d.attributes.hasOverallFeedback = speciesWithOverallFeedback[species]
        ? true
        : false;
      d.attributes.hasDeatiledFeedback = speciesWithDeatiledFeedback[species]
        ? true
        : false;
      d.attributes.hasDataLoaded =
        speciesWithDataLoaded.indexOf(species) !== -1 ? true : false;
      return d.attributes;
    });

    dataModel.setSpeciesLookup(data);

    controllerProps.speciesDataOnReady(data);

    // console.log('init species lookup table', data);
  };

  const initStatusTable = data => {
    data = data.map(d => {
      const lineBreakPattern = /(\r\n\t|\n|\r\t)/g;

      let statusType = d.attributes[config.FIELD_NAME.statusType];

      if (lineBreakPattern.test(statusType)) {
        statusType = statusType.replace(lineBreakPattern, " ");
      }

      return statusType;
    });

    // console.log(data);

    dataModel.setStatus(data);

    controllerProps.legendDataOnReady(getStatusDataForLegend(data));
  };

  // get list of hucs by the species code (modelling extent), then render these hucs on map
  const searchHucsBySpecies = async speciesKey => {
    let data = dataModel.getHucsBySpecies(speciesKey);

    if (data) {
      renderHucsBySpeciesDataOnMap({ data, speciesKey });
    } else {
      try {
        data = await apiManager.queryHucsBySpecies(speciesKey);

        data = data.map(d => {
          return d.attributes;
        });

        dataModel.setHucsBySpecies(speciesKey, data);

        renderHucsBySpeciesDataOnMap({ data, speciesKey });
      } catch (err) {
        console.error(err);
        // if no hucs features returned, pass an empty array so the map will re-render the hucs layers with no highlighted features
        renderHucsBySpeciesDataOnMap({
          data: [],
          speciesKey
        });
      }
    }
  };

  // get previous feedbacks provided by the user
  const queryFeedbacksByUser = async (
    options = {
      userID: "",
      species: "",
      onSuccessHandler: null
    }
  ) => {
    const userID = options.userID || oauthManager.getUserID();
    const onSuccessHandler = options.onSuccessHandler;
    const whereClauseParts = [
      `${config.FIELD_NAME.feedbackTable.userID} = '${userID}'`,
      `${config.FIELD_NAME.feedbackTable.retirementDate} IS NULL`
    ];

    if (options.species) {
      whereClauseParts.push(
        `${config.FIELD_NAME.feedbackTable.species} = '${options.species}'`
      );
    }

    try {
      const feedbacks = await apiManager.fetchFeedback({
        requestUrl: config.URL.feedbackTable + "/query",
        where: whereClauseParts.join(" AND ")
      });

      const formattedFeedbackData = feedbacks.map(d => {
        return {
          userID: d.attributes[config.FIELD_NAME.feedbackTable.userID],
          hucID: d.attributes[config.FIELD_NAME.feedbackTable.hucID],
          species: d.attributes[config.FIELD_NAME.feedbackTable.species],
          status: d.attributes[config.FIELD_NAME.feedbackTable.status],
          comment: d.attributes[config.FIELD_NAME.feedbackTable.comment]
        };
      });

      if (onSuccessHandler) {
        onSuccessHandler(formattedFeedbackData);
      } else {
        feedbackManager.batchAddToDataStore(formattedFeedbackData);
      }

      return feedbacks;
    } catch (err) {
      console.error(err);
    }
  };

  const queryOverallFeedbacksByUser = async () => {
    const userID = oauthManager.getUserID();

    try {
      const feedbacks = await apiManager.fetchFeedback({
        requestUrl: config.URL.overallFeedback + "/query",
        where: `${config.FIELD_NAME.overallFeedback.userID} = '${userID}' AND ${
          config.FIELD_NAME.overallFeedback.retirementDate
        } IS NULL`
      });

      saveOverallFeedbackToDataModel(feedbacks);

      return feedbacks;
    } catch (err) {
      console.error(err);
    }
  };

  // get overall feedbacks for the selected species that are from all users
  const getOverallFeedbacksForReviewMode = async () => {
    const species = dataModel.getSelectedSpecies();

    try {
      const feedbacks = await apiManager.fetchFeedback({
        requestUrl: config.URL.overallFeedback + "/query",
        where: `${
          config.FIELD_NAME.overallFeedback.species
        } = '${species}' AND ${
          config.FIELD_NAME.overallFeedback.retirementDate
        } is NULL`
      });

      controllerProps.overallFeedbackForReviewModeOnReady(feedbacks);
    } catch (err) {
      console.error(err);
    }
  };

  // add data load date
  const postOverallFeedback = async (
    data = {
      rating: 0,
      comment: ""
    }
  ) => {
    const userID = oauthManager.getUserID();
    const species = dataModel.getSelectedSpecies();

    const feature = {
      attributes: {
        [config.FIELD_NAME.overallFeedback.userID]: userID,
        [config.FIELD_NAME.overallFeedback.species]: species,
        [config.FIELD_NAME.overallFeedback.rating]: data.rating,
        [config.FIELD_NAME.overallFeedback.comment]: data.comment
      }
    };

    saveOverallFeedbackToDataModel([feature]);

    try {
      const dataLoadDate = await apiManager.getDataLoadDate(species);
      // console.log(dataLoadDate);

      const feedbacks = await apiManager.fetchFeedback({
        requestUrl: config.URL.overallFeedback + "/query",
        where: `${config.FIELD_NAME.overallFeedback.userID} = '${userID}' AND ${
          config.FIELD_NAME.overallFeedback.species
        } = '${species}'`
      });

      const requestUrl = feedbacks[0]
        ? config.URL.overallFeedback + "/updateFeatures"
        : config.URL.overallFeedback + "/addFeatures";
      // let operationName = 'addFeatures';

      if (feedbacks[0]) {
        feature.attributes.ObjectId = feedbacks[0].attributes.ObjectId;
      }

      if (dataLoadDate) {
        feature.attributes[
          config.FIELD_NAME.overallFeedback.data_load_date
        ] = dataLoadDate;
      }

      apiManager.applyEditToFeatureTable(requestUrl, feature).then(res => {
        console.log("post edit to OverallFeedback table", res);
      });

      controllerProps.onOverallFeedbackSubmit(feature);
    } catch (err) {
      console.error(err);
    }
  };

  const getFeedbacksByUserForReviewMode = (userID = "") => {
    queryFeedbacksByUser({
      userID,
      species: dataModel.getSelectedSpecies(),
      onSuccessHandler: data => {
        controllerProps.clearMapGraphics();

        data.forEach(d => {
          // console.log(d);
          showHucFeatureOnMap(d.hucID, d.status, d);
        });

        controllerProps.feedbackByUsersForReviewModeOnReady(data);
      }
    });
  };

  const getFeedbacksByHucForReviewMode = async hucFeature => {
    const hucID = hucFeature.attributes[config.FIELD_NAME.huc10LayerHucID];
    const hucName = hucFeature.attributes[config.FIELD_NAME.huc10LayerHucName];

    try {
      const feedbacks = await apiManager.fetchFeedback({
        requestUrl: config.URL.feedbackTable + "/query",
        where: `${config.FIELD_NAME.feedbackTable.hucID} = '${hucID}' AND ${
          config.FIELD_NAME.feedbackTable.species
        } = '${dataModel.getSelectedSpecies()}'`
      });

      controllerProps.feedbackByHucsForReviewModeOnReady({
        data: feedbacks,
        hucName
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFeedback = async (data = {}) => {
    // // query feedback table to see if such feature already exists, if so, call update feature operation, otherwise, call add feature operation

    try {
      const feedbacks = await apiManager.fetchFeedback({
        requestUrl: config.URL.feedbackTable + "/query",
        where: `${config.FIELD_NAME.feedbackTable.userID} = '${
          data.userID
        }' AND ${config.FIELD_NAME.feedbackTable.species} = '${
          data.species
        }' AND ${config.FIELD_NAME.feedbackTable.hucID} = '${data.hucID}'`
      });

      if (feedbacks[0]) {
        const requestUrl = config.URL.feedbackTable + "/deleteFeatures";
        const objectID = feedbacks[0].attributes.ObjectId;

        apiManager.deleteFromFeedbackTable(requestUrl, objectID).then(res => {
          console.log("deleted from feedback table", res);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // add data load date
  const postFeedback = async (data = {}) => {
    // console.log(data);

    try {
      const dataLoadDate = await apiManager.getDataLoadDate(data.species);
      // console.log(dataLoadDate);

      const feedbackFeature = {
        attributes: {
          [config.FIELD_NAME.feedbackTable.userID]: data.userID,
          [config.FIELD_NAME.feedbackTable.hucID]: data.hucID,
          [config.FIELD_NAME.feedbackTable.status]: data.status,
          [config.FIELD_NAME.feedbackTable.comment]: data.comment,
          [config.FIELD_NAME.feedbackTable.species]: data.species
        }
      };

      const feedbacks = await apiManager.fetchFeedback({
        requestUrl: config.URL.feedbackTable + "/query",
        where: `${config.FIELD_NAME.feedbackTable.userID} = '${
          data.userID
        }' AND ${config.FIELD_NAME.feedbackTable.species} = '${
          data.species
        }' AND ${config.FIELD_NAME.feedbackTable.hucID} = '${data.hucID}'`
      });

      const requestUrl = feedbacks[0]
        ? config.URL.feedbackTable + "/updateFeatures"
        : config.URL.feedbackTable + "/addFeatures";
      // let operationName = 'addFeatures';

      if (feedbacks[0]) {
        feedbackFeature.attributes.ObjectId = feedbacks[0].attributes.ObjectId;
      }

      if (dataLoadDate) {
        feedbackFeature.attributes[
          config.FIELD_NAME.feedbackTable.data_load_date
        ] = dataLoadDate;
      }

      apiManager
        .applyEditToFeatureTable(requestUrl, feedbackFeature)
        .then(res => {
          console.log("post edit to Feedback table", res);
        });
    } catch (err) {
      console.error(err);
    }
  };

  const getHucsWithFeedbacksForReviewMode = async () => {
    const species = dataModel.getSelectedSpecies();

    if (dataModelForReviewMode.getHucsWithFeedbacks(species)) {
      renderListOfHucsWithFeedbacks();
    } else {
      try {
        const feedbacks = await apiManager.fetchFeedback({
          requestUrl: config.URL.feedbackTable + "/query",
          where: `${config.FIELD_NAME.feedbackTable.species} = '${species}'`,
          outFields: `${config.FIELD_NAME.feedbackTable.hucID}, ${
            config.FIELD_NAME.feedbackTable.status
          }`,
          returnDistinctValues: true
        });

        dataModelForReviewMode.setHucsWithFeedbacks(species, feedbacks);

        renderListOfHucsWithFeedbacks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderHucsBySpeciesDataOnMap = (
    options = {
      data: null,
      speciesKey: ""
    }
  ) => {
    const hucs = options.data || dataModel.getHucsBySpecies();

    if (options.speciesKey) {
      // // TODO: need to use a single feature service instead of separate ones
      // const speciesInfo = dataModel.getSpeciesInfo(options.speciesKey);
      // const actualBoundaryLayerUrl = speciesInfo[config.FIELD_NAME.speciesLookup.boundaryLayerLink];
      // const actualBoundaryLayerUrl =config.URL.PredictedHabitat[options.speciesKey];

      // // TODO: need to create the boundary layer in nature serve's org
      // if(actualBoundaryLayerUrl){
      //     controllerProps.addActualBoundaryLayerToMap(actualBoundaryLayerUrl);
      // }

      controllerProps.showToPredictedHabitatOnMap(options.speciesKey);
    }

    // mapControl.highlightHucs(hucs);

    controllerProps.highligtHucsOnMap(hucs);

    if (!isReviewMode) {
      renderHucWithFeedbackDataOnMap();
    }
  };

  const renderHucWithFeedbackDataOnMap = data => {
    const species = dataModel.getSelectedSpecies();
    data = data || feedbackManager.getFeedbackDataBySpecies(species);

    // console.log('renderHucWithFeedbackDataOnMap >>> species', species);
    // console.log('renderHucWithFeedbackDataOnMap >>> data', data);

    if (data) {
      Object.keys(data).forEach(function(key) {
        // console.log(key, data[key]);

        const hucID = data[key].hucID;
        const status = data[key].status;

        showHucFeatureOnMap(hucID, status, data[key]);
      });
    }
  };

  const setSelectedHucFeature = (feature = null) => {
    state.selectedHucFeature = feature;

    const hucID =
      state.selectedHucFeature.attributes[config.FIELD_NAME.huc10LayerHucID];

    if (!isReviewMode) {
      dataModel.setSelectedHuc(hucID);

      // console.log(selectedHucFeature);
      openFeedbackManager();
    } else {
      // console.log('query feedbacks for selected huc', hucID);
      controllerProps.hucFeatureOnSelectForReviewMode(state.selectedHucFeature);
    }
  };

  const resetSelectedHucFeature = () => {
    state.selectedHucFeature = null;

    dataModel.setSelectedHuc();

    // mapControl.cleanPreviewHucGraphic();

    controllerProps.clearMapGraphics("hucPreview");

    feedbackManager.close();
  };

  const openFeedbackManager = (options = {}) => {
    const userID = oauthManager.getUserID();
    const species = dataModel.getSelectedSpecies();
    const hucID = dataModel.getSelectedHuc();
    const hucName =
      state.selectedHucFeature.attributes[config.FIELD_NAME.huc10LayerHucName];
    const isHucInModeledRange = dataModel.isHucInModeledRange(hucID, species);

    // console.log('isHucInModeledRange', isHucInModeledRange);

    if (userID && species && hucID) {
      feedbackManager.open({
        userID,
        species,
        hucID,
        hucName,
        isHucInModeledRange
      });
    } else {
      console.error(
        "userID, species name and huc id are required to open the feedback manager..."
      );
      resetSelectedHucFeature();
    }
  };

  const getPdfUrlForSelectedSpecies = async () => {
    const species = dataModel.getSelectedSpecies();
    // const url = config.URL.pdf[species];
    // const url = dataModel.getSpeciesInfo(species)[config.FIELD_NAME.speciesLookup.pdfLink];
    try {
      const pdfLookupFeatures = await apiManager.queryPdfTable(species);

      if (
        pdfLookupFeatures[0] &&
        pdfLookupFeatures[0].attributes[config.FIELD_NAME.pdfLookup.url]
      ) {
        // console.log('pdfLookupFeatures[0].url', pdfLookupFeatures[0].attributes[config.FIELD_NAME.pdfLookup.url])
        return pdfLookupFeatures[0].attributes[config.FIELD_NAME.pdfLookup.url];
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  };

  const downloadPdf = async () => {
    // console.log('controller: download pdf');

    const url = await getPdfUrlForSelectedSpecies();

    console.log(url);

    if (url) {
      window.open(url);
    } else {
      console.error("no pdf file is found for selected species", species);
    }
  };

  const getOverallFeedback = () => {
    const species = dataModel.getSelectedSpecies();

    const prevFeedbackData = dataModel.getOverallFeedback(species);

    // console.log(prevFeedbackData);

    const data = prevFeedbackData
      ? {
          rating: prevFeedbackData[config.FIELD_NAME.overallFeedback.rating],
          comment: prevFeedbackData[config.FIELD_NAME.overallFeedback.comment]
        }
      : {};

    return data;
  };

  const saveOverallFeedbackToDataModel = features => {
    // const data = {};

    features.forEach(feature => {
      const key = feature.attributes[config.FIELD_NAME.overallFeedback.species];

      const val = {
        [config.FIELD_NAME.overallFeedback.rating]:
          feature.attributes[config.FIELD_NAME.overallFeedback.rating],
        [config.FIELD_NAME.overallFeedback.comment]:
          feature.attributes[config.FIELD_NAME.overallFeedback.comment]
      };

      dataModel.saveToOverallFeedback(key, val);
    });

    // console.log(data);
  };

  const renderListOfHucsWithFeedbacks = () => {
    const species = dataModel.getSelectedSpecies();
    const features = dataModelForReviewMode.getHucsWithFeedbacks(species);

    // mapControl.clearAllGraphics();

    controllerProps.clearMapGraphics();

    features.forEach(feature => {
      showHucFeatureOnMap(
        feature.attributes[config.FIELD_NAME.feedbackTable.hucID],
        feature.attributes[config.FIELD_NAME.feedbackTable.status]
      );
    });
  };

  const showHucFeatureOnMap = (hucID = "", status = 0, data = null) => {
    if (!hucID) {
      console.error("hucID is missing...");
      return;
    }

    controllerProps.showHucFeatureOnMap(hucID, status);
  };

  const setSelectedSpecies = async val => {
    // console.log('setSelectedSpecies', val);

    dataModel.setSelectedSpecies(val);

    searchHucsBySpecies(val);

    resetSelectedHucFeature();

    controllerProps.speciesOnSelect();

    controllerProps.pdfUrlOnChange(await getPdfUrlForSelectedSpecies());

    if (isReviewMode) {
      getOverallFeedbacksForReviewMode();
      getHucsWithFeedbacksForReviewMode();
    }
  };

  const getStatusDataForLegend = data => {
    data = data.map((d, i) => {
      return {
        label: d
        // color: config.COLOR['status' + i]
      };
    });

    data.unshift({
      label: "Predicted Habitat"
      // color: config.COLOR.actualModeledExtent
    });

    return data;
  };

  const getDistinctSpeciesCodeToReview = data => {
    const distinctSpeciesCode = data.map(d => {
      return d.attributes[config.FIELD_NAME.speciesByUser.speciesCode];
    });
    return distinctSpeciesCode;
  };

  const signOut = () => {
    oauthManager.signOut();
  };

  return {
    init,
    dataModel,
    feedbackManager,
    setSelectedHucFeature,
    resetSelectedHucFeature,
    downloadPdf,
    getOverallFeedback,
    setSelectedSpecies,
    postOverallFeedback,
    getFeedbacksByUserForReviewMode,
    renderListOfHucsWithFeedbacks,
    getFeedbacksByHucForReviewMode,
    signOut
    // openFeedbackManager
  };
}
