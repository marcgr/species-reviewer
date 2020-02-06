export default function(){

    let hucsWithFeedbacks = {};

    const setHucsWithFeedbacks = (species, features)=>{
        console.log('setting hucs with feedbacks for review',species, features);
        hucsWithFeedbacks[species] = features;
    };

    const getHucsWithFeedbacks = (species)=>{
        if(!species){
            console.error('species is required to get Hucs with Feedbacks');
        }
        console.log('getting hucs with feedbacks for review',species);
        return hucsWithFeedbacks[species];
    };

    return {
        setHucsWithFeedbacks,
        getHucsWithFeedbacks
    }
}