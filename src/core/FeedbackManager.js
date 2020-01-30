import FeedbackDataModel from './FeedbackDataModel';

export default function(options={}){

    const feedbackDataStore = {};
    const feedbackDataModel = new FeedbackDataModel();

    const eventHandlers = {
        onAdd: null,
        onClose: null,
        onSubmit: null,
        onRemove: null
    };

    const init = (options={})=>{
        eventHandlers['onAdd'] = options.onOpenHandler || null;
        eventHandlers['onClose'] = options.onCloseHandler || null;
        eventHandlers['onSubmit'] = options.onSubmitHandler || null;
        eventHandlers['onRemove'] = options.onRemoveHandler || null;
    };

    const open = (data={})=>{

        console.log('opening feedback manager',data);

        // if data is already in dataStore, use the item from data store instead because it has the status and comments info
        data = getSavedItemFromDataStore(data) || data;

        feedbackDataModel.init(data);

        if(eventHandlers['onAdd']){
            eventHandlers['onAdd'](feedbackDataModel.getFeedbackData());
        }

        // console.log(feedbackDataModel.getFeedbackData());
    };

    const close = ()=>{
        feedbackDataModel.reset();

        if(eventHandlers['onClose']){
            eventHandlers['onClose']()
        }
    };

    const submit = ()=>{
        const feedbackData =  feedbackDataModel.getFeedbackData();

        console.log('submit feedback data', feedbackData);

        save(feedbackData);

        if(eventHandlers['onSubmit']){
            eventHandlers['onSubmit'](feedbackData);
        }
    };

    const save = (feedbackData)=>{
        console.log('save feedback data', feedbackData);
        let _feedbackData = feedbackData.hucsBySpecies ? feedbackData.hucsBySpecies : [feedbackData];
        _feedbackData.forEach(huc => {
            console.log('saving species for huc',huc);
            const hucID = huc.hucID;
            const species = huc.species;

            if (!feedbackDataStore[species]) {
                feedbackDataStore[species] = {};
            }

            feedbackDataStore[species][hucID] = JSON.parse(JSON.stringify(huc));
        });


        // console.log(feedbackDataStore);
    };

    const remove = ()=>{

        const feedbackData =  feedbackDataModel.getFeedbackData();
        console.log('remove feedback data', feedbackData);
        let _feedbackData = feedbackData.hucsBySpecies ? feedbackData.hucsBySpecies : [feedbackData];
        _feedbackData.forEach(huc => {
            removeFromDataStore(huc.species, huc.hucID);

            // console.log('remove feedback', feedbackData);

            if (eventHandlers['onRemove']) {
                eventHandlers['onRemove'](huc);
            }
        });
    };

    const removeFromDataStore = (species, hucID)=>{
        console.log('removeFromDataStore', species, hucID, feedbackDataStore[species][hucID]);
        if(feedbackDataStore[species][hucID]){
            console.log('before delete', feedbackDataStore);
            delete feedbackDataStore[species][hucID];
             console.log('after delete', feedbackDataStore);
        }
    };

    const getSavedItemFromDataStore = (data)=>{
        console.log('XXXXXXXXXXXXXXXXXXXXX',data);
        let dataWithSavedDataFromDataStore = [];
        if (data.hucsBySpecies) {
            data.hucsBySpecies.forEach(huc => {
                console.log('YYYYYYYYYY', huc);
                const savedItem = typeof feedbackDataStore[huc.species] !== 'undefined' &&
                    typeof feedbackDataStore[huc.species][huc.hucID] !== 'undefined' ?
                    feedbackDataStore[huc.species][huc.hucID] :
                    null;

                // if (savedItem && typeof savedItem.hucName === 'undefined' && huc.hucName) {
                //     savedItem.hucName = hucName;
                // }
                console.log('saved item?', savedItem, feedbackDataStore[huc.species][huc.hucID]);
                if (savedItem) {
                    huc.isSaved = true;
                    huc.status = savedItem.status;
                    huc.comment = savedItem.comment;
                    //savedItem.isHucInModeledRange = data.isHucInModeledRange;
                }
                dataWithSavedDataFromDataStore.push(huc);
            });
        }
        data.hucsBySpecies = dataWithSavedDataFromDataStore;
        console.log('data with saved data attached if available', data);

        //return data;
        // const hucID = data.hucID;
        // const species = data.species;
        // const hucName = data.hucName;

        // // console.log('get Saved Item From DataStore', species, hucID, feedbackDataStore[species]);
        // const savedItem = typeof feedbackDataStore[species] !== 'undefined' && typeof feedbackDataStore[species][hucID] !== 'undefined' ? feedbackDataStore[species][hucID] : null;

        // if(savedItem && typeof savedItem.hucName === 'undefined' && hucName){
        //     savedItem.hucName = hucName;
        // }

        // if(savedItem){
        //     savedItem.isSaved = true;
        //     savedItem.isHucInModeledRange = data.isHucInModeledRange;
        // }

        //return savedItem;
        return data;
    };

    const batchAddToDataStore = (data)=>{
        // console.log(data);

        data.forEach(d=>{
            save(d);
        });

        // console.log(feedbackDataStore);
    };

    const getFeedbackDataBySpecies = (species)=>{
        console.log('getFeedbackDataBySpecies', species);
        return feedbackDataStore[species];
    };

    return {
        init,
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