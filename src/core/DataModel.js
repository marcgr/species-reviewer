export default class DataModel {

    constructor(options={}){

        this.speciesLookup = [];
        this.hucsBySpecies = {};
        this.status = [];
        this.selectedSpecies = null;      
        this.selectedHuc = null;  
        // this.selectedHucName = null;
    };

    init(){

    };

    setSpeciesLookup(data=[]){
        this.speciesLookup = data;
    };

    setHucsBySpecies(species, data=[]){
        this.hucsBySpecies[species] = data;
        // this.hucsBySpecies = data;
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

    getHucsBySpecies(species){
        species = species || this.selectedSpecies;
        return this.hucsBySpecies[species];
    };

    getStatusByIndex(index){
        return index && this.status[+index] ? this.status[+index] : null;
    }
};