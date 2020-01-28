import config from '../config';

export default class DataModel {

    constructor(options={}){

        this.speciesLookup = [];
        this.hucsBySpecies = {};
        // this.hucsBySpeciesDictionary = {};
        this.status = [];
        this.selectedSpecies = null;
        this.selectedHuc = null;
        this.selectedHucs = [];
        this.overallFeedback = {};
        // this.selectedHucName = null;
    };

    init(){

    };

    setSpeciesLookup(data=[]){
        this.speciesLookup = data;
    };

    getSpeciesInfo(speciesCode=''){
        const speciesInfo = this.speciesLookup.filter(d=>{
            return d[config.FIELD_NAME.speciesLookup.speciesCode] === speciesCode
        })[0];
        return speciesInfo;
    }

    setHucsBySpecies(species, data=[]){
        this.hucsBySpecies[species] = data;
        // this.hucsBySpecies = data;
        // console.log('hucsBySpecies', species, this.hucsBySpecies[species])
    };

    saveToOverallFeedback(key, val){
        this.overallFeedback[key] = val;
        // this.hucsBySpecies = data;
    };

    // setHucsBySpeciesDictionary(species, data=[]){
    //     const dict = {};

    //     data.forEach(d=>{
    //         dict[d.HUC10] =
    //     })

    //     this.hucsBySpeciesDictionary[species] = data;
    //     // this.hucsBySpecies = data;
    // };

    setStatus(data=[]){
        this.status = data;
        // console.log(this.status);
    };

    setSelectedSpecies(val=null){
        this.selectedSpecies = val;
    }

    getSelectedSpecies(){
        return this.selectedSpecies;
    }

    setSelectedHucs(val = null) {
        //this.selectedHuc = val;
        console.log('set selected hucs', val, this.selectedHucs)
        if (val) {
            this.selectedHucs.push(val);
        } else {
            this.selectedHucs = [];
        }
    }

    getSelectedHucs(){
        console.log('get selected hucs so nice', this.selectedHucs)
        return this.selectedHucs[0];
    }

    getHucsBySpecies(species){
        species = species || this.selectedSpecies;
        return this.hucsBySpecies[species];
    };

    getStatusByIndex(index){
        return index && this.status[+index] ? this.status[+index] : null;
    };

    isHucInModeledRange(hucID, species){

        const hucs = this.hucsBySpecies[species];

        //console.log('isHucInModeledRange', hucID, hucs);

        if(hucs){
            return hucs.filter(d=>{ return d[config.FIELD_NAME.speciesDistribution.hucID].toString() === hucID }).length ? true : false;
        } else {
            return false;
        }

        // const isHucInModeledRange = hucs.filter(d=>{ return d[config.FIELD_NAME.speciesDistribution.hucID] === hucID }).length ? true : false;

        // return isHucInModeledRange;
    };

    getOverallFeedback(key){
        return this.overallFeedback[key];
    }
};