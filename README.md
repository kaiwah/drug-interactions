# How To Run
0. **Prereq** Node and NPM are installed
1. Extract Files to Drive
2. Run `npm install`
3. Run `npm start`
---
### Problem
Identify any drug to drug interaction that might occur based in a set of inputs

### Assumptions
1. Allow for command line input that can potentially have multiple drugs per line
2. Allow for multiple lines per execution (Need a closing key -- maybe a double line break?)
3. Allow for case-insensitive inputs
4. Must return most Major severity
5. There is a 4th severity called `contraindication` which is synonymous to `major`
6. Ignore duplicates
7. The interactions.json file is free of any duplicates and is objectively correct

### Questions
1. What happens when multiple major severity is found with the input combination, do we just show 1 or show all of them?
---
## Methodology
Step 1: **Preprocessing**

Upon the starting of the application, we should preprocess the data included in the `interactions.json` in order to create a hashmap/dict that points to the array index for quick lookups. The time this will take is O(n), with n as # of objects in the interactions array.

_Hashmap Structure_
```
{
  wordA: int[],
  wordB: int[],
  wordAwordB: int,
  ...
}
```
Hashmap will have a worst-case space complexity of O(3n) given that we need to store the individual drug as well as the pair combination.

Step 2: **Input Processing**

Since the input is not always a fixed length, it will add complexity to our solution. In order to accommodate min=1;max=20 input, we will need a quick and efficient way to find all relevant information based on the given input and to skip any potential duplicate. 

Given the format is `word1 word2 word3 word4 ... wordn`

We will need to do pair-processing such that: `word1word2 word1word3 word1word4 ... word1wordn`

_Assuming that all words are *unique*_, then no duplicate work is done. If words are *not* unique, then there will be duplicate work. Best way to combat this is to pre-sort the input and then any duplicates will be next to each other. A duplicate is identified such that `word[i] === word[i-1] ? skip : continue`

Step 3: **Lookup**

We have our pair, the lookup should be simple thanks to our hashmap. For each pair, do a hashmap lookup, and depending on severity, we can modify the return output.

There's one of two ways we can have a efficient return:
1. A simple POJO with key = severity; val = string[]
2. A array that is kept pre-sorted with quick-insertion (pivot)

For the sake of time, the simpler way is Option #1 but shall we run into performance bottlenecks, we can use Option #2.

Step 4: **Display Results**

Loop through output arraay and display each line

