'use strict';

module.exports = {
    'oauthAppID': 'pXyO9t8Sf4goOQiu',
    'webMapID': 'dc559da0f101490eb2aed03d063a290d',

    'FIELD_NAME': {
        'huc10LayerHucID': 'HUC10',
        'huc10LayerHucName': 'NAME',
        'speciesLookupHucID': 'HUC10',
        'statusType': 'StatusType',
        'feedbackTable': {
            'hucID': 'HUCID',
            'userID': 'UserID',
            'species': 'Species',
            'comment': 'Comment',
            'status': 'StatusType'
        },
    },

    'DOM_ID': {
        'mapViewContainer': 'viewDiv',
        "speciesSelector": 'speciesSelectorDiv',
        'feedbackControl': 'feedbackControlDiv'
    },

    "URL": {
        "rangeReviewHucServiceBase": "",
        "speciesLookupTable": 'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/SpeciesLookup/FeatureServer/1',
        "statusTable": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/StatusTable/FeatureServer/0",
        "feedbackTable": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/SpeciesFeedbackTable/FeatureServer/0",

        "speciesExtent": {
            "IsotriaMedeoloides": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/IsotriaMedeoloides/FeatureServer/4",
            "LithobatesKauffeldi": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/LithobatesKauffeldi/FeatureServer/3",
        }
    }
};