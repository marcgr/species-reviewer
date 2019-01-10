import FeedbackDataModel from './FeedbackDataModel';

export default function(options={}){

    const feedbackDataStore = {};
    const feedbackDataModel = new FeedbackDataModel();

    const onOpenHandler = options.onOpenHandler || null;
    const onCloseHandler = options.onCloseHandler || null;
    const onSubmitHandler = options.onSubmitHandler || null;
    const onRemoveHandler = options.onRemoveHandler || null;

    const open = (data={})=>{

        // if data is already in dataStore, use the item from data store instead because it has the status and comments info 
        data = getSavedItemFromDataStore(data) || data;

        feedbackDataModel.init(data);

        if(onOpenHandler){
            onOpenHandler(feedbackDataModel.getFeedbackData());
        }

        // console.log(feedbackDataModel.getFeedbackData());
    };

    const close = ()=>{
        feedbackDataModel.reset();

        if(onCloseHandler){
            onCloseHandler()
        }
    };

    const submit = ()=>{

        const feedbackData =  feedbackDataModel.getFeedbackData();

        save(feedbackData);

        if(onSubmitHandler){
            onSubmitHandler(feedbackData);
        }
    };

    const save = (feedbackData)=>{
        const hucID = feedbackData.hucID;
        const species = feedbackData.species;

        if(!feedbackDataStore[species]){
            feedbackDataStore[species] = {};
        }

        feedbackDataStore[species][hucID] = JSON.parse(JSON.stringify(feedbackData));

        // console.log(feedbackDataStore);
    };

    const remove = ()=>{
        const feedbackData =  feedbackDataModel.getFeedbackData();

        removeFromDataStore(feedbackData.species, feedbackData.hucID);

        // console.log('remove feedback', feedbackData);

        if(onRemoveHandler){
            onRemoveHandler(feedbackData);
        }
    };

    const removeFromDataStore = (species, hucID)=>{
        if(feedbackDataStore[species][hucID]){
            delete feedbackDataStore[species][hucID];
        }
    };

    const getSavedItemFromDataStore = (data)=>{
        const hucID = data.hucID;
        const species = data.species;
        const hucName = data.hucName;

        // console.log('get Saved Item From DataStore', species, hucID, feedbackDataStore[species]);
        const savedItem = typeof feedbackDataStore[species] !== 'undefined' && typeof feedbackDataStore[species][hucID] !== 'undefined' ? feedbackDataStore[species][hucID] : null;
        
        if(savedItem && typeof savedItem.hucName === 'undefined' && hucName){
            savedItem.hucName = hucName;
        }

        if(savedItem){
            savedItem.isSaved = true;
            savedItem.isHucInModeledRange = data.isHucInModeledRange;
        }

        return savedItem;
    };

    const batchAddToDataStore = (data)=>{
        // console.log(data);

        data.forEach(d=>{
            save(d);
        });

        // console.log(feedbackDataStore);
    };

    const getFeedbackDataBySpecies = (species)=>{
        // console.log('getFeedbackDataBySpecies', species);
        return feedbackDataStore[species];
    };

    return {
        open,
        close,
        save,
        submit,
        remove,
        feedbackDataModel,
        batchAddToDataStore,
        getFeedbackDataBySpecies
    };

}