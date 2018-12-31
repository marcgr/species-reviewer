export default class FeedbackManager{

    constructor(options={}){
        this.userID = null;
        this.hucID = null;
        this.species = null;
        this.status = null;   
        this.comment = null;  
        this.hucName = null;
    };

    init(options){
        this.userID = options.userID || null;
        this.hucID = options.hucID || null;
        this.species = options.species || null;
        this.hucName = options.hucName || null;
        this.status = options.status || null;   
        this.comment = options.comment || null; 
    };

    // setUserID(val=''){
    //     this.userID = val;
    // };

    // setHucID(val=''){
    //     this.hucID = val;
    // };

    // setSpecies(val=''){
    //     this.species = val;
    // };

    setStatus(val=''){
        this.status = val;
    };

    setComment(val=''){
        this.comment = val;
    };

    reset(){
        this.userID = null;
        this.hucID = null;
        this.species = null;
        this.status = null;   
        this.comment = null; 
        this.hucName = null;
    };

    getFeedbackData(){
        return {
            userID: this.userID,
            hucID: this.hucID,
            species: this.species,
            status: this.status,
            comment: this.comment,
            hucName: this.hucName
        };
    }

}