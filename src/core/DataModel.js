export default class DataModel {

    constructor(options={}){

        this.speciesLookup = [];
        this.hucsBySpecies = [];
        this.status = [];        
    };

    init(){

    };

    setSpeciesLookup(data=[]){
        this.speciesLookup = data;
    };

    setHucsBySpecies(data=[]){
        this.hucsBySpecies = data;
    };

};