const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const session = require('express-session');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const etherscan = require('etherscan-api').init(process.env.ETHERSCAN_API);
const app = express();

app.use(session({secret: 'anything-you-want-but-keep-secret'}));
app.use( bodyParser.urlencoded( { extended: false } ) );

app.post('/sms', (req, res) => {
  const smsCount = req.session.counter || 0;


  // PARSING LOGIC
  // temp bullshit to show that you can chain messages
  let message = 'Hello, thanks for the new message: ' + req.body.Body;

  if(smsCount > 0) {
    message = 'Hello, thanks for message number ' + (smsCount + 1);
  }
  req.session.counter = smsCount + 1;

  // this would be where you would take parsed results
  // and use with the api
  let balance = etherscan.account.balance('0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae');
  balance.then(function(balanceData){
    console.log(balanceData);
  });



  // SEND RESPONSE BACK TO USER
  const twiml = new MessagingResponse();
  twiml.message(message);

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});

