const express = require('express')
const async = require('async');
const app = express()
const port = 3000;
var _ = require('lodash');
const readline = require("readline");
const request = require('request');
const inquirer = require('inquirer');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var constant =  require('./CONSTANT')

var dictFunction = function(){
    rl.question("./dict  ", function(inputDictCmd) {
        if(inputDictCmd){
            var userInput = inputDictCmd.split(" ");
            if(userInput.length === 2){
                var opr = userInput[0];
                var word = userInput[1];
                if(opr && opr === 'defn' || opr === 'syn' || opr === 'ant' || opr === 'ex'){
                    if(opr === 'defn'){
                        var requestType = 'definitions';
                        var requestUrl = constant.apiHost + 'word/' + word +'/'+ requestType + constant.api_key;
                        request.get(requestUrl, function (err, res) {
                            if(err){
                                console.log(JSON.stringify(err));
                            }else{
                                var res = JSON.parse(res.body)
                                _.forEach(res, function(eachDef){
                                    console.log("=>  ", eachDef.text);
                                })
                            }
                        });
                    } else if(opr === 'syn'){
                        var requestType = 'relatedWords';
                        var requestUrl = constant.apiHost + 'word/' + word +'/'+ requestType + constant.api_key;
                        request.get(requestUrl, function (err, res) {
                            if(err){
                                console.log(JSON.stringify(err));
                            }else{
                                var res = JSON.parse(res.body);
                                _.forEach(res, function(eachRelatedWord){
                                    if(eachRelatedWord.relationshipType === 'synonym'){
                                        _.forEach(eachRelatedWord.words, function(eachSyn){
                                            console.log("=>  ", eachSyn);
                                        })
                                    }else{
                                        console.log("NO synonym avilable");
                                    }
                                })
                            }
                        });
                    } else if(opr === 'ant'){
                        var requestType = 'relatedWords';
                        var requestUrl = constant.apiHost + 'word/' + word +'/'+ requestType + constant.api_key;
                        request.get(requestUrl, function (err, res) {
                            if(err){
                                console.log(JSON.stringify(err));
                            }else{
                                var res = JSON.parse(res.body);
                                _.forEach(res, function(eachRelatedWord){
                                    if(eachRelatedWord.relationshipType === 'antonym'){
                                        _.forEach(eachRelatedWord.words, function(eachSyn){
                                            console.log("=>  ", eachSyn);
                                        })
                                    }
                                })
                            }
                        });
                    } else if(opr === 'ex'){
                        var requestType = 'examples';
                        var requestUrl = constant.apiHost + 'word/' + word +'/'+ requestType + constant.api_key;
                        request.get(requestUrl, function (err, res) {
                            if(err){
                                console.log(JSON.stringify(err));
                            }else{
                                var res = JSON.parse(res.body);
                                _.forEach(res.examples, function(eachEx){
                                    console.log("=>  ", eachEx.text);
                                })
                            }
                        });
                    }
                }
            }else if (userInput.length === 1 && inputDictCmd.toLowerCase() != 'play') {
                return randomWords(inputDictCmd)
            }else if (userInput.length === 1 && inputDictCmd.toLowerCase() === 'play'){
                return playDict();
            }  
        }else{
            return randomWords();
        }
        rl.close();
    });
    
    rl.on("close", function() {
        process.exit(0);
    });
};

var randomWords = function(singleWord){
    var requestUrl =  constant.apiHost + 'words/randomWord' + constant.api_key;
    var randomWordData = []
    request.get(requestUrl, function (err, res) {
        if(err){
            console.log(JSON.stringify(err));
        }else{
            var ranWordOBJ = JSON.parse(res.body);
            if(singleWord && singleWord != undefined){
                var ranWord = singleWord;
            }else{
                var ranWord = ranWordOBJ.word;
                console.log("word of the day is", ranWord);
            }
            console.log();
            randomWordData.push({ranWord: ranWord});
            request.get(constant.apiHost + 'word/' + ranWord +'/definitions' + constant.api_key, function (err, res) {
                if(err){
                    return err;
                }else{
                    var definitionsRandom = JSON.parse(res.body);
                    if(definitionsRandom.error){
                        console.log(definitionsRandom.error);
                    }else{
                        console.log(ranWord.toUpperCase(), "Defination----------");
                        _.forEach(definitionsRandom, function(eachDefforRandom){
                            console.log("=>  ",   eachDefforRandom.text);
                        })
                        randomWordData.push({defination: definitionsRandom});
                        request.get(constant.apiHost + 'word/' + ranWord +'/relatedWords' + constant.api_key, function (err, res) {
                            if(err){
                                return err;
                            }else{
                                console.log("");
                                var res = JSON.parse(res.body);
                                _.forEach(res, function(eachRelatedWordForRan){
                                    if(eachRelatedWordForRan.relationshipType === 'antonym'){
                                        console.log(ranWord.toUpperCase(), "Antonyms ----------");
                                        _.forEach(eachRelatedWordForRan.words, function(antoWords){
                                            console.log("=>  ", antoWords);
                                        })
                                        console.log("");
                                    }else if(eachRelatedWordForRan.relationshipType === 'synonym'){
                                        console.log(ranWord.toUpperCase(), "Synonym -----------");
                                        _.forEach(eachRelatedWordForRan.words, function(synoWords){
                                            console.log("=>  ",   synoWords);
                                        })
                                    }    
                                })
                                randomWordData.push({synAnt: res});
                                // console.log(randomWordData);process.exit(0);
                                request.get(constant.apiHost + 'word/' + ranWord +'/examples' + constant.api_key, function (err, res) {
                                    if(err){
                                        return err;
                                    }else{
                                        var exampleRandom = JSON.parse(res.body);
                                        console.log("");
                                        console.log(ranWord.toUpperCase(), "Examples -----------");
                                        _.forEach(exampleRandom.examples, function(eachRandExm){
                                            console.log("=>   ", eachRandExm.text);
                                        })
                                        randomWordData.push(exampleRandom);
                                        
                                        return randomWordData;
                                    }
                                })
                            }
                        })
                    }
                }
            })
        }
    });
};

var playDict = function(){
    var requestUrl =  constant.apiHost + 'words/randomWord' + constant.api_key;
    var randomWordData = [];
    request.get(requestUrl, function (err, res) {
        if(err){
            console.log(JSON.stringify(err));
        }else{
            var ranWordOBJ = JSON.parse(res.body);
            var ranWord = ranWordOBJ.word;
            randomWordData.push({ranWord: ranWord});
            request.get(constant.apiHost + 'word/' + ranWord +'/definitions' + constant.api_key, function (err, res) {
                if(err){
                    return err;
                }else{
                    var definitionsRandom = JSON.parse(res.body);
                    randomWordData.push({defination: definitionsRandom});
                    request.get(constant.apiHost + 'word/' + ranWord +'/relatedWords' + constant.api_key, function (err, res) {
                        if(err){
                            return err;
                        }else{
                            var res = JSON.parse(res.body);
                            randomWordData.push({synAnt: res});
                            console.log("\n", "---------Dictionary Game----------");
                            console.log("Guess the word using given information");
                            console.log("---------------------------------------------");
                            
                            var gameDataGenerator = function(){
                                var randomWordDef = randomWordData[1].defination[Math.floor(Math.random()*randomWordData[1].defination.length)].text;

                                var randomWordSyn = (randomWordData[2].synAnt[0].words[Math.floor(Math.random()*randomWordData[2].synAnt[0].words.length)] || randomWordData[2].synAnt[1].words[Math.floor(Math.random()*randomWordData[2].synAnt[1].words.length)]) 
    
                                return [randomWordDef, randomWordSyn]
                            }

                            var userRetryResponse = function(userInput){
                                if(userInput === '1'){
                                    initGameInfo();
                                }else if(userInput === '2'){
                                    var result = gameDataGenerator()
                                    console.log("\n", result[0], "\n", result[1]);
                                }else{
                                    process.exit(0);
                                }
                            }

                            var failedRes = function(){
                                console.log("Please select:- ", "\n", "1) Try again", "\n" , "2) New Hint", "\n", "3) Quit"  );
                                inquirer.prompt([
                                    {
                                        type: "inputs",
                                        name: "enter choice",
                                        choices: ['alligator', 'crocodile'],
                                    }
                                ]).then(function(data) {
                                        userRetryResponse(data['enter choice'])
                                });
                            }

                            var initGameInfo = function(){
                                var result = gameDataGenerator()
                                console.log(result[0], "\n", result[1]);
                                inquirer.prompt([
                                    {
                                        type: "input",
                                        name: "guessWord",
                                        message: "\nEnter Your Guess Word:-  "
                                    }
                                ]).then(function(data) {
                                        if(data.guessWord != randomWordData[0].ranWord){
                                            console.log("Wrrong Guess", "\n");
                                            failedRes();
                                        }else{
                                            console.log("success");
                                            process.exit(0);
                                        }
                                });
                            }
                            initGameInfo();
                        }
                    })          
                }
            })
        }
    });
}

dictFunction();

app.listen(port)