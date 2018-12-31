import FeedbackDataModel from './FeedbackDataModel';

export default function(options={}){

    const feedbackDataStore = {};
    const feedbackDataModel = new FeedbackDataModel();

    const onOpenHandler = options.onOpenHandler || null;
    const onCloseHandler = options.onCloseHandler || null;
    const onSubmitHandler = options.onSubmitHandler || null;

    const open = (data={})=>{

        // if data is already in dataStore, use the item from data store instead because it has the status and comments info 
        data = getSavedItemFromDataStore(data.hucID, data.species) || data;

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

        const feedbackData =  feedbackDataModel.getFeedbackData()

        save(feedbackData);

        if(onSubmitHandler){
            onSubmitHandler(feedbackData);
        }
    };

    const save = (feedbackData)=>{
        const hucID = feedbackData.hucID;
        const species = feedbackData.species;

        if(!feedbackDataStore[hucID]){
            feedbackDataStore[hucID] = {};
        }

        feedbackDataStore[hucID][species] = JSON.parse(JSON.stringify(feedbackData));

        console.log(feedbackDataStore);
    };

    const remove = ()=>{

    };

    const getSavedItemFromDataStore = (hucID, species)=>{
        console.log(hucID, feedbackDataStore[hucID])
        return typeof feedbackDataStore[hucID] !== 'undefined' && typeof feedbackDataStore[hucID][species] !== 'undefined' ? feedbackDataStore[hucID][species] : null;
    };

    // const checkIfAlreadyInDataStore = (data)=>{

        

    //     if(savedFeedbackData){
    //         data.status = savedFeedbackData.status;
    //         data.comment = savedFeedbackData.comment;
    //     }

    //     return data;
    // };

    return {
        open,
        close,
        save,
        submit,
        feedbackDataModel
    };

}