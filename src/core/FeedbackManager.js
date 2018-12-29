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

        // console.log(feedbackDataModel);
    };

    const close = ()=>{
        feedbackDataModel.reset();

        if(onCloseHandler){
            onCloseHandler()
        }
    };

    const submit = ()=>{

        save(feedbackDataModel.getFeedbackData());
    };

    const save = (feedbackData)=>{
        const hucID = feedbackData.hucID;
        const species = feedbackData.species;

        if(!feedbackDataStore[hucID]){
            feedbackDataStore[hucID] = {};
        }

        feedbackDataStore[hucID][species] = JSON.parse(JSON.stringify(feedbackData));
    };

    const remove = ()=>{

    };

    const getSavedItemFromDataStore = (hucID, species)=>{
        return feedbackDataStore[hucID] && feedbackDataStore[hucID][species] ? feedbackDataStore[hucID][species] : null;
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
        save
    };

}