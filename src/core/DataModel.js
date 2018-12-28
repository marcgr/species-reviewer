export default class DataModel {

    constructor(options={}){

        this.speciesLookup = [];
        this.hucsBySpecies = [];
        this.status = [];
        this.selectedSpecies = null;      
        this.selectedHuc = null;  
    };

    init(){

    };

    setSpeciesLookup(data=[]){
        this.speciesLookup = data;
    };

    setHucsBySpecies(data=[]){
        this.hucsBySpecies = data;
    };

    setStatus(data=[]){
        this.status = data;
    };

    setSelectedSpecies(val=null){
        this.selectedSpecies = val;
    }

    getSelectedSpecies(){
        return this.selectedSpecies;
    }

    setSelectedHuc(val=null){
        this.selectedHuc = val;
    }

    getSelectedHuc(){
        return this.selectedHuc;
    }

};