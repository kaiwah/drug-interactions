'use strict';
/**
 * Class RX
 * @description: Main class for handling all drug related functionality */
var RX = /** @class */ (function () {
    function RX(interactionsPath) {
        if (interactionsPath === void 0) { interactionsPath = ''; }
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
        console.log("Loading " + this.interactions.length + " Interactions");
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
        console.log("Created " + Object.keys(drugMap).length + " Assoc mappings");
        return;
    };
    /**
     * @returns object|boolean
     * @description: checks if there is a interaction between two drug pairs
     *  (ASSUMPTION: PRESORTED)
     */
    RX.prototype.getInteraction = function (drug1, drug2) {
        if (drug2 === void 0) { drug2 = ''; }
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
        var left = 0, right = 1, output = { major: [], moderate: [], minor: [] };
        do {
            var reaction = this.getInteraction(inputSorted[left], inputSorted[right]);
            if (reaction)
                output[reaction.severity].push(reaction);
            if (right === inputSorted.length - 1) {
                ++left;
                right = left + 1;
            }
            else {
                ++right;
            }
        } while (left < right && right < inputSorted.length);
        console.log(output);
        return output;
    };
    /**
     * @returns string
     * @description: displays the most severe interaction based on a line input
     */
    RX.prototype.showInteraction = function (input) {
        var results = this.getAllInteractions(input);
        var context = null;
        if (results.major.length)
            context = results.major;
        else if (results.moderate.length)
            context = results.moderate;
        else if (results.minor.length)
            context = results.minor;
        return (context)
            ? context.reduce(function (ret, val) { return ret += val.severity + ": " + val.description; }, '')
            : 'No Interaction';
    };
    return RX;
}());
/* process the input */
// todo: cli input here but use static value first
var Ro = new RX();
//const results = Ro.showInteraction("sildenafil tamsulosin lovastatin");
var results = Ro.showInteraction("sildenafil");
console.log(results);
