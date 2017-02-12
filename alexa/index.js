/**
 
 Copyright 2016 Brian Donohue.
 
*/

'use strict';
const request = require('superagent');
var loanerInfo = require('./loaner.json')
//handleLoanRequest();
// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
     
//     if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.05aecccb3-1461-48fb-a008-822ddrt6b516") {
//         context.fail("Invalid Application ID");
//      }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    var cardTitle = "Hello, World!"
    var speechOutput = "You can tell Hello, World! to say Hello, World!"
    callback(session.attributes,
        buildSpeechletResponse(cardTitle, speechOutput, "", true));
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == 'GetInformation') {
        handleInfoRequest(intent, session, callback);
    }
    else if (intentName == 'GetAdvice'){
        handleAdviceRequest(intent, session, callback);
    }
    else if (intentName == "GetLoan"){
        handleLoanRequest(intent, session, callback);
    }
    else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // Add any cleanup logic here
}

function handleInfoRequest(intent, session, callback) {
    var speech = "";
    var actualIntent = intent.slots.information.value
    if (actualIntent == "application deadline"){
        speech = "It's in 2019"
    }
    else if (actualIntent == "maintenance loan"){
        speech = "I don't have information on that, sorry"
    }
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speech, "", "true"));
}

function handleAdviceRequest(intent, session, callback) {
    var speech = "";
    var actualIntent = intent.slots.advice.value;
    
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speech, "", "true"));
    
}

function handleLoanRequest(intent, session, callback){
    var speech = "";
    var sentence = intent.slots.loan.value;
    //var sentence = "threshold user id 1"
    var sentenceIntent = sentence.split(" ")
    var actualIntent = sentence.split(" ")

    if (actualIntent.length >= 5){
      var newIntent=[]
      newIntent.push(actualIntent[0]+actualIntent[1]);
      newIntent.push(actualIntent[2])
      newIntent.push(actualIntent[3]);
      newIntent.push(actualIntent[4])
      actualIntent = newIntent
      speech = "The "+sentenceIntent[0]+" "+sentenceIntent[1]+ " of User ID " 
    } else {
      speech = "The "+sentenceIntent[0]+" of User ID "
    }

    var column = actualIntent[0];
    var id = actualIntent[3] - 1;
    
    var requiredInfo = loanerInfo[id][column]

    if (column == 'debt' || column == 'annualincome' || column == 'threshold'){
      requiredInfo += " pounds"
    } else if (column == 'interestrate'){
      requiredInfo += " per cent"
    } else if (column == "endyear"){
      requiredInfo += " years"
    }
 
  
    speech += (id+1)+" is "+requiredInfo
    console.log(speech)


    callback(session.attributes,
      buildSpeechletResponseWithoutCard(speech,"","true"));
}

// ------- Helper functions to build responses -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}