'use strict';

interface DrugJson {
  drugs: string[];
  severity: string;
  description: string;
}
/**
 * Class RX
 * @description: Main class for handling all drug related functionality */
class RX {
  drugMap: object;
  interactions: DrugJson[];
  constructor(interactionsPath: string = ''){
    this.load(interactionsPath);
    this.preprocess();
  }
  load(path: string){
    this.interactions = require(path || './data/interactions.json');
  }
  /**
   * @returns: boolean
   * @description: creates a hashmap of all interaction associations for quick in-memory check
   */
  preprocess(){
    console.log(`Loading ${this.interactions.length} Interactions`);
    let drugMap = {};
    for (let i = 0; i < this.interactions.length; ++i){
      const drugs = this.interactions[i].drugs.sort();
      for (const drug of this.interactions[i].drugs){
        if (drugMap.hasOwnProperty(drug))
          drugMap[drug].push(i);
        else
          drugMap[drug] = [i];
      }
      drugMap[drugs.join('')] = i;
    }
    this.drugMap = drugMap;
    console.log(`Created ${Object.keys(drugMap).length} Assoc mappings`);
    return;
  }
  /**
   * @returns object|boolean
   * @description: checks if there is a interaction between two drug pairs 
   *  (ASSUMPTION: PRESORTED)
   */
  getInteraction(drug1: string, drug2: string = ''){
    const key = drug1+drug2;
    return (this.drugMap.hasOwnProperty(key)) 
      ? this.interactions[ this.drugMap[key] ]
      : false;
  }
  /**
   * @returns: string
   * @description: takes a input line and returns drug interactions 
   */
  getAllInteractions(input: string){
    const inputSorted = input.split(' ').sort();
    let left = 0, right = 1, output = { major: [], moderate: [], minor: [] };
    do {
      const reaction = this.getInteraction(inputSorted[left], inputSorted[right]);
      if (reaction)
        output[reaction.severity].push( reaction );
      if (right === inputSorted.length - 1){
        ++left;
        right = left + 1;
      } else {
        ++right;
      }
    } while (left < right && right < inputSorted.length);
    console.log(output);
    return output;
  } 
  /**
   * @returns string
   * @description: displays the most severe interaction based on a line input
   */
  showInteraction(input: string){
    const results = this.getAllInteractions(input);
    let context = null;
    if (results.major.length)
      context = results.major;
    else if (results.moderate.length)
      context = results.moderate;
    else if (results.minor.length)
      context = results.minor;
    return (context)
      ? context.reduce(( ret, val ) => { return ret += `${val.severity}: ${val.description}`},'')
      : 'No Interaction';
  }

}

/* process the input */
// todo: cli input here but use static value first
const Ro = new RX();
//const results = Ro.showInteraction("sildenafil tamsulosin lovastatin");
const results = Ro.showInteraction("sildenafil");
console.log(results);

