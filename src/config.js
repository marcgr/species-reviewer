'use strict';

module.exports = {
    // 'oauthAppID': 'pXyO9t8Sf4goOQiu', // old one under content org
    //'oauthAppID': 'Dks28Xk6zIbYoWbO',
    'oauthAppID': 'ZzenR9GsVLP7AmlY',
    //'webMapID': '8aa946565e6d46d7affa9a67d8fb914b',
    'webMapID': '286120c4a4fb4d6daac446edd9e97540',
    'portalUrl': 'https://lib-gis1.library.oregonstate.edu/arcgis',

    'FIELD_NAME': {
        'hucLayerHucID': 'huc12',
        'hucLayerHucName': 'name',
        'speciesLookupHucID': 'huc12',
        'statusType': 'statustype',
        'speciesLookup': {
            'speciesCode': 'element_global_id',
            'speciesCuteCode': 'cutecode',
            'speciesName': 'scientific_name',
            'taxa': 'taxonomic_group',
            'boundaryLayerLink': 'boundarylayerlink',
            'pdfLink': 'pdlLink'
        },
        'speciesDistribution': {
            'speciesCode': 'speciescode',
            'hucID': 'hucid'
        },
        'feedbackTable': {
            'hucID': 'hucid',
            'userID': 'userid',
            'species': 'species',
            'comment': 'comment_',
            'status': 'statustype',
            'retirementDate': 'retirementdate',
            'data_load_date': 'dataloaddate'
        },
        'overallFeedback': {
            'userID': 'userid',
            'species': 'species',
            'comment': 'comment_',
            'rating': 'rating',
            'retirementDate': 'retirementdate',
            'data_load_date': 'dataloaddate'
        },
        'speciesByUser': {
            'speciesCode': 'element_global_id',
            'email': 'Reviewer_email'
        },
        'pdfLookup': {
            'speciesCode': 'cutecode',
            'url': 'url'
        },
        'data_load_date': {
            'species_code': 'cutecode',
            'data_load_date': 'dataloaddate'
        }
    },

    'DOM_ID': {
        'mainControl': 'mainControlDiv',
        'mapViewContainer': 'viewDiv',
        "speciesSelector": 'selectorsDiv',
        'feedbackControl': 'feedbackControlDiv',
        'overallFeedbackControl': 'overallFeedbackDiv',
        'legend': 'legendDiv',
        'listViewOverallFeedback': 'listViewForOverallFeedbackDiv',
        'listViewDeatiledFeedback': 'listViewForDetailedFeedbackDiv',
        'listViewForFeedbacksByHuc': 'listViewForFeedbacksByHucDiv',
        'searchWidgetDiv': 'searchWidgetDiv',
        'layerListDiv': 'layerListDiv'
    },

    "URL": {

        //"speciesLookupTable": 'https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Species_Master_Lookup/FeatureServer/0',
        "speciesLookupTable": 'https://lib-gis3.library.oregonstate.edu/arcgis/rest/services/Hosted/SpeciesMasterLookup/FeatureServer/0',

        //"speciesDistribution": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Species_Modeling_Extent/FeatureServer/0",
        "speciesDistribution": "https://lib-gis3.library.oregonstate.edu/arcgis/rest/services/Hosted/Species_Modeling_Extent/FeatureServer/0",

        //"speciesByUser": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Species_by_Reviewers/FeatureServer/0",
        "speciesByUser": "https://lib-gis3.library.oregonstate.edu/arcgis/rest/services/Hosted/SpeciesReviewersLookup/FeatureServer/0",

        //"statusTable": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Status_Code_Lookup/FeatureServer/0",
        "statusTable": "https://lib-gis3.library.oregonstate.edu/arcgis/rest/services/Hosted/Status_Code_Lookup/FeatureServer/0",
        //"feedbackTable": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Detailed_Feedback/FeatureServer/0",
        "feedbackTable": "https://lib-gis3.library.oregonstate.edu/arcgis/rest/services/Hosted/Detailed_Feedback/FeatureServer/0",
        //"overallFeedback": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Overall_Feedback/FeatureServer/0",
        "overallFeedback": "https://lib-gis3.library.oregonstate.edu/arcgis/rest/services/Hosted/Overall_Feedback/FeatureServer/0",

        // "PredictedHabitat": {
        //     // "137976": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Isotria_medeloides_Boundary/FeatureServer/0",
        //     // "941975": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Lithobates_kauffeldi_Boundary/FeatureServer/0",
        //     "line": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Predicted_Habitat_Line/FeatureServer/0",
        //     "polygon": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Predicted_Habitat_Polygon/FeatureServer/0"
        // },
        //"pdfLookup": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/PDF_Lookup/FeatureServer/0",
        "pdfLookup": "https://lib-gis3.library.oregonstate.edu/arcgis/rest/services/Hosted/PDF_Lookup/FeatureServer/0",

        "WatershedBoundaryDataset_HUC12": "https://lib-gis1.library.oregonstate.edu/arcgis/rest/services/watersheds/oregon_watersheds/FeatureServer/3",
        //"data_load_date": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Data_Load_Date/FeatureServer/0"
        "data_load_date": "https://lib-gis3.library.oregonstate.edu/arcgis/rest/services/Hosted/Data_Load_Date/FeatureServer/0"

    },

    "reference_layers": {
        "usa_protected_areas": {
            //"itemId": "dd6077b7b71c4492aceab1ae0146ad1c",
            //OE Portal item id
            "itemId": "bdf6f40921dd4e68a7a6a7779778d571",
            "title": "USA Protected Areas"
        },
        "USA_NLCD_Land_Cover_2011": {
            //"itemId": "aa71e15357a14dbb93a50ef3a8e06f70",
            //OE Portal item id
            "itemId": "8667845812be4d7fa683f1db9f5f9e52",
            "title": "USA NLCD Land Cover"
        },
        "USA_Forest_Type": {
            //"itemId": "593d022dbeb24c3abbf6c509fd592dd2",
            //OE Portal item id
            "itemId": "df87a547d8a24056ac0ea63b80d8dd4c",
            "title": "USA Forest Type"
        },
        "USA_Wetlands": {
            //"itemId": "0cb75b1f54854ad188302cd8b260c98f",
            //OE Portal item id
            "itemId": "0af8e39ad622419c8b1cf1648a2ecf95",
            "title": "USA Wetlands"
        }
    },

    "COLOR": {
        "hucBorder": [255, 255, 255, 0.3],
        "hucBorderIsModeled": [255, 255, 102, .5],
        "hucBorderCommentWithoutAction": [239,35,60, 1],
        "hucFill": [217, 217, 102, .4],
        "status0": [200,200,200,.5],
        "status1": [166,219,160,.5],
        "status2": [194,165,207,.5],
        "actualModeledExtent": "#ffd400"
    }
};