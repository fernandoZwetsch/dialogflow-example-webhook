"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const request = require('request');
const restService = express();
var shell = require('shelljs');
var mysql = require('mysql');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

let intentMap = new Map();

restService.use(
  bodyParser.urlencoded({
    extended: true
  })
);
//9d1e09fd-82e4-453f-8973-14295b883133-b4ef8d5f' 'x-forwarded-for': '66.249.84.160',
//515eb8e8-b07a-47ac-85b6-a2752765f98b-b4ef8d5f', x-forwarded-for': '66.249.84.166',

restService.use(bodyParser.json());

let mapFunctions = {
  "Cardapio": cardapio()

}
restService.post("/returnTwilio", async function (req, res) {

  console.log(req.body);
  console.log("==================");
  console.log("HEADER", req.headers);
  console.log("==================");
  //req.body.body = mensagem do usuario
  //req.body.from =  numero de telefone do usuario
  console.log(req.body.Body);
  console.log(req.body.From);
  let messageTo = req.body.To;
  let messageFrom = req.body.From;
  // let authToken = await shell.exec('gcloud auth application-default print-access-token').stdout;
  // authToken = authToken.trim();
  let authToken = "ya29.c.Kl65B8iZja5rBJZq3AlsZ-1Ea5azfb3HuPcsCn1tZ-EaqY1wM3QxPChI-qsHA9LYn_4pMGpFXybGiaQ7y9PstpfDUnlsq-FR4KPgU8KsdsqquRhkmZcWBD3f_mV5HL69"
  console.log(authToken);
  let twilioBody = await dialogflowSendMessage(authToken, req.body.Body);//retorna a resposta do bot
  console.log("--------------------------------------------------------");
//pega o queryName e passar pelos  map
//se existir retorno 
//manda parao o twilio
let sendConfig = {
  from: messageTo,
  body: twilioBody.queryResult.fulfillmentText,
  to: messageFrom
};
for (const iterator of twilioBody.queryResult.fulfillmentMessages) {
  console.log(iterator.text.text);
   sendConfig.body = iterator.text.text
  await sendMessageToTwilio(sendConfig);
}

});

function sendMessageToTwilio(config) {
  return new Promise((resolve, reject) => {
    // {
    //   body: config.body,
    //   from: from,
    //   // mediaUrl: ['https://demo.twilio.com/owl.png'],
    //   to: to
    // }
    client.messages
      .create(config)
      .then(message => resolve(message))
      .done();
  });
}
function dialogflowSendMessage(token, message) {
  return new Promise((resolve, reject) => {
    let sessionCode = new Date().getTime();
    let requestConfig = {
      url: `https://dialogflow.googleapis.com/v2/projects/bot003-mogacw/agent/sessions/1234565${sessionCode}:detectIntent`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      json: {
        "query_input": {
          "text": {
            "text": message,
            "language_code": "pt-BR"
          }
        }
      },
      method: "POST"
    };
    request(requestConfig, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
      // for (const iterator of body.queryResult.fulfillmentMessages) {
      //   console.log(iterator.text.text);
      // }
      resolve(body);
    });
  });
}

restService.post("/teste", function (req, res) {
  console.log("DIALOGFLOW CHAMOU");
  // console.log(req.body);
  // console.log("==================");
  // console.log("HEADER", req.headers);
  // console.log("==================");
  // let options = {
  //     url: "https://dialogflow.googleapis.com/v2/projects/bot003-mogacw/agent/sessions/123456789:detectIntent",
  //     method : "POST",
  //     headers : {
  //       'Content-Type': 'application/json',
  //       Authorization : "Bearer $(gcloud auth application-default print-access-token)"
  //     },
  //     json : {
  //       'displayName': 'StartStopwatch',
  //       'priority': 500000,
  //       'mlEnabled': true,
  //       'trainingPhrases': [
  //           {
  //               'type': 'EXAMPLE',
  //               'parts': [
  //                   {
  //                       'text': 'start stopwatch'
  //                   }
  //               ]
  //           }
  //       ],
  //       'action': 'start',
  //       'messages': [
  //           {
  //               'text': {
  //                   'text': [
  //                       'Stopwatch started'
  //                   ]
  //               }
  //           }
  //       ],
  //   }
  // }
  return res.json({
    payload: "speechResponse",
    data: "speechResponse",
    fulfillmentText: "speech",
    speech: "speech",
    displayText: "speech",
    source: "webhook-echo-sample"
  });

  let intent = req.body.queryResult.intent || {};
  let myreturn = mapFunctions[intent.displayName];
  var speech = myreturn;

  // var speech =
  //   req.body.queryResult &&
  //     req.body.queryResult.parameters &&
  //     req.body.queryResult.parameters.echoText
  //     ? req.body.queryResult.parameters.echoText
  //     : "Seems like some problem. Speak again.";

  var speechResponse = {
    google: {
      expectUserResponse: true,
      richResponse: {
        items: [
          {
            simpleResponse: {
              textToSpeech: speech
            }
          }
        ]
      }
    }
  };

  return res.json({
    payload: speechResponse,
    //data: speechResponse,
    fulfillmentText: speech,
    speech: speech,
    displayText: speech,
    source: "webhook-echo-sample"
  });
});


restService.post("/echo", function (req, res) {
  // console.log(req);
  var con = mysql.createConnection({
    host: "mysql669.umbler.com",
    port: "41890",
    user: "chatbot",
    database: 'chatbot-base',
    password: "Zweass123"
  });
  con.connect();
  // con.query('SELECT * FROM `Pedidos` ', function (error, results, fields) {
  //  console.log(fields);
  //   console.log(results);

  // });
  con.end();
  // con.end();
  // con.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  // });

  //  console.log(req.headers);
  //  console.log(req.body);
  //  console.log("===================FULLFILMENT");
  //  console.log(req.body.queryResult.fulfillmentMessages);
  //  console.log(req.body.queryResult.fulfillmentMessages[0]);
  //  console.log(req.body.queryResult.fulfillmentMessages[0].text);

  //  console.log("===================OUTPUTCONTECText");
  //  console.log(req.body.queryResult.outputContexts);



  var speech =
    req.body.queryResult &&
      req.body.queryResult.parameters &&
      req.body.queryResult.parameters.echoText
      ? req.body.queryResult.parameters.echoText
      : "Seems like some problem. Speak again.";

  var speechResponse = {
    google: {
      expectUserResponse: true,
      richResponse: {
        items: [
          {
            simpleResponse: {
              textToSpeech: speech
            }
          }
        ]
      }
    }
  };

  return res.json({
    payload: speechResponse,
    //data: speechResponse,
    fulfillmentText: speech,
    speech: speech,
    displayText: speech,
    source: "webhook-echo-sample"
  });
});

restService.post("/audio", function (req, res) {
  var speech = "";
  switch (req.body.result.parameters.AudioSample.toLowerCase()) {
    //Speech Synthesis Markup Language 
    case "music one":
      speech =
        '<speak><audio src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
      break;
    case "music two":
      speech =
        '<speak><audio clipBegin="1s" clipEnd="3s" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
      break;
    case "music three":
      speech =
        '<speak><audio repeatCount="2" soundLevel="-15db" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
      break;
    case "music four":
      speech =
        '<speak><audio speed="200%" src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio></speak>';
      break;
    case "music five":
      speech =
        '<audio src="https://actions.google.com/sounds/v1/cartoon/slide_whistle.ogg">did not get your audio file</audio>';
      break;
    case "delay":
      speech =
        '<speak>Let me take a break for 3 seconds. <break time="3s"/> I am back again.</speak>';
      break;
    //https://www.w3.org/TR/speech-synthesis/#S3.2.3
    case "cardinal":
      speech = '<speak><say-as interpret-as="cardinal">12345</say-as></speak>';
      break;
    case "ordinal":
      speech =
        '<speak>I stood <say-as interpret-as="ordinal">10</say-as> in the class exams.</speak>';
      break;
    case "characters":
      speech =
        '<speak>Hello is spelled as <say-as interpret-as="characters">Hello</say-as></speak>';
      break;
    case "fraction":
      speech =
        '<speak>Rather than saying 24+3/4, I should say <say-as interpret-as="fraction">24+3/4</say-as></speak>';
      break;
    case "bleep":
      speech =
        '<speak>I do not want to say <say-as interpret-as="bleep">F&%$#</say-as> word</speak>';
      break;
    case "unit":
      speech =
        '<speak>This road is <say-as interpret-as="unit">50 foot</say-as> wide</speak>';
      break;
    case "verbatim":
      speech =
        '<speak>You spell HELLO as <say-as interpret-as="verbatim">hello</say-as></speak>';
      break;
    case "date one":
      speech =
        '<speak>Today is <say-as interpret-as="date" format="yyyymmdd" detail="1">2017-12-16</say-as></speak>';
      break;
    case "date two":
      speech =
        '<speak>Today is <say-as interpret-as="date" format="dm" detail="1">16-12</say-as></speak>';
      break;
    case "date three":
      speech =
        '<speak>Today is <say-as interpret-as="date" format="dmy" detail="1">16-12-2017</say-as></speak>';
      break;
    case "time":
      speech =
        '<speak>It is <say-as interpret-as="time" format="hms12">2:30pm</say-as> now</speak>';
      break;
    case "telephone one":
      speech =
        '<speak><say-as interpret-as="telephone" format="91">09012345678</say-as> </speak>';
      break;
    case "telephone two":
      speech =
        '<speak><say-as interpret-as="telephone" format="1">(781) 771-7777</say-as> </speak>';
      break;
    // https://www.w3.org/TR/2005/NOTE-ssml-sayas-20050526/#S3.3
    case "alternate":
      speech =
        '<speak>IPL stands for <sub alias="indian premier league">IPL</sub></speak>';
      break;
  }
  return res.json({
    speech: speech,
    displayText: speech,
    source: "webhook-echo-sample"
  });
});

restService.post("/video", function (req, res) {
  return res.json({
    speech:
      '<speak>  <audio src="https://www.youtube.com/watch?v=VX7SSnvpj-8">did not get your MP3 audio file</audio></speak>',
    displayText:
      '<speak>  <audio src="https://www.youtube.com/watch?v=VX7SSnvpj-8">did not get your MP3 audio file</audio></speak>',
    source: "webhook-echo-sample"
  });
});

restService.post("/slack-test", function (req, res) {
  var slack_message = {
    text: "Details of JIRA board for Browse and Commerce",
    attachments: [
      {
        title: "JIRA Board",
        title_link: "http://www.google.com",
        color: "#36a64f",

        fields: [
          {
            title: "Epic Count",
            value: "50",
            short: "false"
          },
          {
            title: "Story Count",
            value: "40",
            short: "false"
          }
        ],

        thumb_url:
          "https://stiltsoft.com/blog/wp-content/uploads/2016/01/5.jira_.png"
      },
      {
        title: "Story status count",
        title_link: "http://www.google.com",
        color: "#f49e42",

        fields: [
          {
            title: "Not started",
            value: "50",
            short: "false"
          },
          {
            title: "Development",
            value: "40",
            short: "false"
          },
          {
            title: "Development",
            value: "40",
            short: "false"
          },
          {
            title: "Development",
            value: "40",
            short: "false"
          }
        ]
      }
    ]
  };
  return res.json({
    speech: "speech",
    displayText: "speech",
    source: "webhook-echo-sample",
    data: {
      slack: slack_message
    }
  });
});



function cardapio() {
  // var con = mysql.createConnection({
  //   host: "mysql669.umbler.com",
  //   port: "41890",
  //   user: "chatbot",
  //   database: 'chatbot-base',
  //   password: "Zweass123"
  // });
  // con.connect();
  // con.query('SELECT * FROM `Cardapio` ', function (error, results, fields) {
  //   // console.log(fields);
  //   console.log(results);

  // });
  // con.end();
  return "cardapio ====>"
}


intentMap.set('enviarDB', enviarDB);
let functions = intentMap.get("enviarDB");
console.log(functions("ss"))


function enviarDB(gg) {
  //  const text = agent.parameters.texto;
  //  var newkey = admin.database().ref().child('Clientes').push().key;
  //  admin.database().ref('Clientes/'+ newkey).set({
  //    first_name: "fernando",
  //    last_name : 'ggg',
  //    agent : agent,
  //    text : text

  //  }); 
  //   console.log("agente = >>");
  //   console.log(agent);


  return ('Suas informações já foram salvasTeste ' + gg);
}











restService.listen(3000, function () {
  console.log("Server up and listening");
});
