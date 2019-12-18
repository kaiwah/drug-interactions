'use strict';
/* global imports */
var chalk = require('chalk');
var log = console.log;
/**
 * Class RX
 * @description: Main class for handling all drug related functionality */
var RX = /** @class */ (function () {
    function RX(interactionsPath) {
        if (interactionsPath === void 0) { interactionsPath = ''; }
        log(chalk.red.bold('Welcome to Ro\'s Drug Interaction Terminal'));
        this.readline = require('readline');
        this.load(interactionsPath);
        this.preprocess();
    }
    RX.prototype.load = function (path) {
        this.interactions = require(path || './data/interactions.json');
    };
    /**
     * @returns: boolean
     * @description: creates a hashmap of all interaction associations for quick in-memory check
     */
    RX.prototype.preprocess = function () {
        log(chalk.gray("+ Loading " + this.interactions.length + " Interactions"));
        var drugMap = {};
        for (var i = 0; i < this.interactions.length; ++i) {
            var drugs = this.interactions[i].drugs.sort();
            for (var _i = 0, _a = this.interactions[i].drugs; _i < _a.length; _i++) {
                var drug = _a[_i];
                if (drugMap.hasOwnProperty(drug))
                    drugMap[drug].push(i);
                else
                    drugMap[drug] = [i];
            }
            drugMap[drugs.join('')] = i;
        }
        this.drugMap = drugMap;
        log(chalk.gray("+ Created " + Object.keys(drugMap).length + " Assoc mappings"));
        return;
    };
    /**
     * @returns object|boolean
     * @description: checks if there is a interaction between two drug pairs
     *  (ASSUMPTION: PRESORTED)
     */
    RX.prototype.getInteraction = function (drug1, drug2) {
        if (drug2 === void 0) { drug2 = ''; }
        if (drug1 === drug2)
            return false; // same drug 
        var key = drug1 + drug2;
        return (this.drugMap.hasOwnProperty(key))
            ? this.interactions[this.drugMap[key]]
            : false;
    };
    /**
     * @returns: string
     * @description: takes a input line and returns drug interactions
     */
    RX.prototype.getAllInteractions = function (input) {
        var inputSorted = input.split(' ').sort();
        var left = 0, right = 1, output = null;
        do {
            var reaction = this.getInteraction(inputSorted[left], inputSorted[right]);
            if (reaction) {
                switch (reaction.severity) {
                    case 'contraindication':
                        reaction.severity = 'major'; // changing to major for consistency
                    case 'major':
                        return reaction;
                        break; // major found, skip everything else
                    case 'moderate':
                        output = reaction;
                        break;
                    default:
                        if (!output)
                            output = reaction;
                }
            }
            if (inputSorted[right + 1] === inputSorted[right])
                ++right; // duplicate -- skip 1
            if (right >= inputSorted.length - 1) {
                if (inputSorted[left + 1] === inputSorted[left])
                    ++left; // duplicate -- skip 1
                ++left;
                right = left + 1;
            }
            else {
                ++right;
            }
        } while (left < right && left < inputSorted.length);
        return output;
    };
    /**
     * @returns string
     * @description: displays the most severe interaction based on a line input
     */
    RX.prototype.showInteraction = function (input) {
        var result = this.getAllInteractions(input.toLowerCase());
        return (result)
            ? result.severity + ": " + result.description
            : 'No Interaction';
    };
    /**
     * @returns null
     * @description: begins terminal for stdin listening
     **/
    RX.prototype.terminal = function () {
        var _this_1 = this;
        var results = [];
        var _this = this, term = this.readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
        log(chalk.cyan('\n# To get started, please type in or paste any combination of drugs where you want to know the effects of.\nPress enter twice to execute the lookup.\n'));
        term.on('line', function (input) {
            if (input !== '') {
                results.push(_this_1.showInteraction(input));
            }
            else {
                for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
                    var interaction = results_1[_i];
                    switch (interaction.substring(0, 3)) {
                        case 'maj':
                            log(chalk.red.bold(interaction));
                            break;
                        case 'mod':
                            log(chalk.red(interaction));
                            break;
                        case 'min':
                            log(chalk.yellow(interaction));
                            break;
                        default:
                            log(chalk.green(interaction));
                    }
                }
                results = []; // resetting the inputs
                log(); // linebreak
            }
            return true;
        });
        term.on('close', function (input) {
            log(chalk.green.bold('goodbye'));
        });
    };
    return RX;
}());
var Ro = new RX();
Ro.terminal();
