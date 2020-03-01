var requestUrl =  constant.apiHost + 'words/randomWord' + constant.api_key;
var randomWordData = []
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
                        request.get(constant.apiHost + 'word/' + ranWord +'/examples' + constant.api_key, function (err, res) {
                            if(err){
                                return err;
                            }else{
                                var exampleRandom = JSON.parse(res.body);
                                randomWordData.push(exampleRandom);
                                console.log(randomWordData);
                                // return randomWordData;
                            }
                        })
                    }
                })          
            }
        })
    }
});
