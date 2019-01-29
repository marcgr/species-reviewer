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
        'overallFeedback': {
            'userID': 'UserID',
            'species': 'Species',
            'comment': 'Comment',
            'rating': 'Rating'
        }
    },

    'DOM_ID': {
        'mainControl': 'mainControlDiv',
        'mapViewContainer': 'viewDiv',
        "speciesSelector": 'speciesSelectorDiv',
        'feedbackControl': 'feedbackControlDiv',
        'overallFeedbackControl': 'overallFeedbackDiv',
        'legend': 'legendDiv',
        'listViewOverallFeedback': 'listViewForOverallFeedbackDiv'
    },

    "URL": {
        "rangeReviewHucServiceBase": "",
        "speciesLookupTable": 'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/SpeciesLookup/FeatureServer/1',
        "statusTable": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/StatusTable/FeatureServer/0",
        "feedbackTable": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/SpeciesFeedbackTable/FeatureServer/0",
        "overallFeedback": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/OverallFeedback/FeatureServer/0",

        "speciesExtent": {
            "IsotriaMedeoloides": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/IsotriaMedeoloides/FeatureServer/4",
            "LithobatesKauffeldi": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/LithobatesKauffeldi/FeatureServer/3",
        },

        "speciesActualBoundaries": {
            "IsotriaMedeoloides": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Isotria_medeloides_Boundary/FeatureServer/0",
            "LithobatesKauffeldi": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Lithobates_kauffeldi_Boundary/FeatureServer/0"
        },

        "pdf": {
            "IsotriaMedeoloides":'https://arcgis-content.maps.arcgis.com/sharing/rest/content/items/36b79f8ad4bd4157b85fadb2317fcb6b/data'
        }
    },

    "COLOR": {
        "hucBorder": [255, 255, 255, 0.3],
        "hucBorderIsModeled": [255, 255, 255, .5],
        "hucFill": [217, 217, 217, .4],
        "status0": [200,200,200,.5],
        "status1": [166,219,160,.5],
        "status2": [194,165,207,.5],
        "actualModeledExtent": "#ffd400"
    }
};