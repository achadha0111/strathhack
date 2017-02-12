const request = require('superagent')

var baseUrl = "https://api.fieldbook.com/v1/589f5c6afe584704004f7a41/loaners"

request.get(baseUrl)
  .end((err,res)=> {
    if (err) { console.log('ERROR') }
    console.log('OK')
    console.log(res.body)
    var fs = require('fs');
    fs.writeFile("loaner.txt", res.body, function(err) {
    if(err) {
        return console.log(err);
    }
});

  });



