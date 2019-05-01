'use strict';

module.exports = {
    // 'oauthAppID': 'pXyO9t8Sf4goOQiu', // old one under content org
    'oauthAppID': 'Dks28Xk6zIbYoWbO',
    'webMapID': '8aa946565e6d46d7affa9a67d8fb914b',

    'FIELD_NAME': {
        'huc10LayerHucID': 'HUC10',
        'huc10LayerHucName': 'NAME',
        'speciesLookupHucID': 'HUC10',
        'statusType': 'StatusType',
        'speciesLookup': {
            'speciesCode': 'cutecode',
            'speciesName': 'Scientific_Name',
            'taxa': 'Taxonomic_Group',
            'boundaryLayerLink': 'BoundaryLayerLink',
            'pdfLink': 'PdfLink'
        },
        'speciesDistribution': {
            'speciesCode': 'SpeciesCode',
            'hucID': 'HUCID'
        },
        'feedbackTable': {
            'hucID': 'HUCID',
            'userID': 'UserID',
            'species': 'Species',
            'comment': 'Comment',
            'status': 'StatusType',
            'retirementDate': 'RetirementDate'
        },
        'overallFeedback': {
            'userID': 'UserID',
            'species': 'Species',
            'comment': 'Comment',
            'rating': 'Rating',
            'retirementDate': 'RetirementDate'
        },
        'speciesByUser': {
            'speciesCode': 'cutecode',
            'email': 'Reviewer_email'
        },
        'pdfLookup': {
            'speciesCode': 'cutecode',
            'url': 'url'
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
        // "speciesLookupTable": 'https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/SpeciesLookupTable/FeatureServer/0',
        "speciesLookupTable": 'https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Species_Master_Lookup/FeatureServer/0',

        // "speciesDistribution": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/SpeciesDistribution/FeatureServer/0",
        "speciesDistribution": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Species_Modeling_Extent/FeatureServer/0",

        "speciesByUser": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Species_by_Reviewers/FeatureServer/0",
        
        "statusTable": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Status_Code_Lookup/FeatureServer/0",
        "feedbackTable": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Detailed_Feedback/FeatureServer/0",
        "overallFeedback": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Overall_Feedback/FeatureServer/0",

        "PredictedHabitat": {
            // "137976": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Isotria_medeloides_Boundary/FeatureServer/0",
            // "941975": "https://services.arcgis.com/jIL9msH9OI208GCb/arcgis/rest/services/Lithobates_kauffeldi_Boundary/FeatureServer/0",
            "line": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Predicted_Habitat_Line/FeatureServer/0",
            "polygon": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/Predicted_Habitat_Polygon/FeatureServer/0"
        },
        "pdfLookup": "https://services.arcgis.com/EVsTT4nNRCwmHNyb/arcgis/rest/services/PDF_Lookup/FeatureServer/0"
    },

    "reference_layers": {
        "usa_protected_areas": {
            "itemId": "dd6077b7b71c4492aceab1ae0146ad1c",
            "title": "USA Protected Areas"
        },
        "USA_NLCD_Land_Cover_2011": {
            "itemId": "aa71e15357a14dbb93a50ef3a8e06f70",
            "title": "USA NLCD Land Cover"
        },
        "USA_Forest_Type": {
            "itemId": "593d022dbeb24c3abbf6c509fd592dd2",
            "title": "USA Forest Type"
        },
        "USA_Wetlands": {
            "itemId": "0cb75b1f54854ad188302cd8b260c98f",
            "title": "USA Wetlands"
        }
    },

    "COLOR": {
        "hucBorder": [255, 255, 255, 0.3],
        "hucBorderIsModeled": [255, 255, 255, .5],
        "hucBorderCommentWithoutAction": [239,35,60, 1],
        "hucFill": [217, 217, 217, .4],
        "status0": [200,200,200,.5],
        "status1": [166,219,160,.5],
        "status2": [194,165,207,.5],
        "actualModeledExtent": "#ffd400"
    }
};