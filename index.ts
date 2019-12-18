'use strict';

/* global imports */
const chalk = require('chalk');
const log = console.log;

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
  readline: any;
  interactions: DrugJson[];
  constructor(interactionsPath: string = ''){
    log(chalk.red.bold('Welcome to Ro\'s Drug Interaction Terminal'));
    this.readline = require('readline');
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
    log(chalk.gray(`+ Loading ${this.interactions.length} Interactions`));
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
    log(chalk.gray(`+ Created ${Object.keys(drugMap).length} Assoc mappings`));
    return;
  }
  /**
   * @returns object|boolean
   * @description: checks if there is a interaction between two drug pairs 
   *  (ASSUMPTION: PRESORTED)
   */
  getInteraction(drug1: string, drug2: string = ''){
    if (drug1 === drug2) 
      return false; // same drug 
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
    let left = 0, right = 1, output = null;
    do {
      const reaction = this.getInteraction(inputSorted[left], inputSorted[right]);
      if (reaction){
        switch (reaction.severity){
          case 'contraindication':
            reaction.severity = 'major'; // changing to major for consistency
          case 'major':
            return reaction; break; // major found, skip everything else
          case 'moderate':
            output = reaction; break;
          default:
            if (!output)
              output = reaction;
        }
      }
      if (inputSorted[right+1] === inputSorted[right])
        ++right; // duplicate -- skip 1
      if (right >= inputSorted.length - 1){
        if (inputSorted[left+1] === inputSorted[left])
          ++left; // duplicate -- skip 1
        ++left;
        right = left + 1;
      } else {
        ++right;
      }
    } while (left < right && left < inputSorted.length);
    return output;
  } 
  /**
   * @returns string
   * @description: displays the most severe interaction based on a line input
   */
  showInteraction(input: string){
    const result = this.getAllInteractions(input.toLowerCase());
    return (result)
      ? `${result.severity}: ${result.description}`
      : 'No Interaction';
  }
  /**
   * @returns null
   * @description: begins terminal for stdin listening 
   **/
  terminal(){
    let results = [];
    const _this = this, term = this.readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    
    log(chalk.cyan('\n# To get started, please type in or paste any combination of drugs where you want to know the effects of.\nPress enter twice to execute the lookup.\n'));
    term.on('line', (input)=>{
      if (input !== ''){
        results.push(this.showInteraction(input));
      } else {
        for (const interaction of results){
          switch (interaction.substring(0,3)){
            case 'maj':
              log(chalk.red.bold(interaction)); break;
            case 'mod':
              log(chalk.red(interaction)); break;
            case 'min':
              log(chalk.yellow(interaction)); break;
            default:
              log(chalk.green(interaction));
          }
        }
        results = []; // resetting the inputs
        log(); // linebreak
      }
      return true;
    });
    term.on('close', input => {
      log(chalk.green.bold('goodbye'));
    });
  }
}

const Ro = new RX();
Ro.terminal();


// explicit tests for functionality
//const results = Ro.showInteraction("sildenafil");
//const results = Ro.showInteraction("tamsulosin lovastatin");
//const results = Ro.showInteraction("sildenafil tamsulosin lovastatin");
//const results = Ro.showInteraction("sildenafil sildenafil nicotine rescinnamine");
//log(results);

