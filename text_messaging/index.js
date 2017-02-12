const http = require('http')
const express = require('express')
const twilio = require('twilio')
const accountSid = 'SK2993a7e88b1451381f5181b148f3f709'
const authToken = 'Y05FoG3Bn5pI4JzR7JYJABFMuKKRzHzC'
const bodyParser = require('body-parser')
const _ = require('lodash')
const request = require('request')
const client = require('twilio')(accountSid, authToken)
const recast = require('recastai')
const recastClient = new recast.Client('a0946e041c196c34e7eef0743dc706f3', 'en')
const app = express()


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.post('/', (req, res) => {
	const twiml = new twilio.TwimlResponse()
	var sentence = req.body.Body
    recastClient.textRequest(sentence)
    	.then(result => {
    		var intent = result.intents[0].slug
    		var slc = result.get('slc')
    		var loan_category = result.get('loan-category')
    		var payment = result.get('payment')
    		var user = result.get('user')
    		var debt_query = result.get('debt-query')
    		var duration = result.get('duration')
            var change_query = result.get('change_request')
            var message = ""
            var bookId = '589f5c6afe584704004f7a41';
            var baseUrl = 'https://api.fieldbook.com/v1/' + bookId
    		if (intent == "userloaninformation") {
                if (!user) {
                    message = "Please provide your unique user id in your request"
                    console.log(message)
                    twiml.message(message)
                    res.writeHead(200, {'Content-Type': 'text/xml'})
                    res.end(twiml.toString())
                }
                request(baseUrl + '/loaners/' + user.raw, function(error, response, body) {
                    var obj = JSON.parse(body)
                    if(!error && payment) {
                        message = "Your interest rate is " + obj.interestrate +  " percent"
                        console.log(message)
                        
                    } 
                    else if (!error && debt_query) {
                        message = "You currently owe " + obj.debt +  " pounds."
                    }

                    if (message != "") {
                       twiml.message(message)
                       res.writeHead(200, {'Content-Type': 'text/xml'})
                       res.end(twiml.toString()) 
                    }  
                })  
            }

            else if(intent == 'getinformation') {
                
            }
		 	
    	
    	}).catch(function(err){
    		twiml.message('ERROR')
    	})
})

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});