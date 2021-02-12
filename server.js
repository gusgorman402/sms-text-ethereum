const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const session = require('express-session');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const etherscan = require('etherscan-api').init(process.env.ETHERSCAN_API, 'rinkeby');
const app = express();

app.use(session({secret: 'anything-you-want-but-keep-secret'}));
app.use( bodyParser.urlencoded( { extended: false } ) );

app.post('/sms', (req, res) => {

/*
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

*/

  var helpRegex = /^commands/i,
      balanceRegex = /^balance\:(0x[0-9A-Fa-f]{40})/gi,
      nonceRegex = /^nonce\:(0x[0-9A-Fa-f]{40})/gi,
      ethusdPriceRegex = /^eth2usd/i,
      gasPriceRegex = /^gasprice/i,
//      lastFiveRegex = /^last5tx\:(0x[0-9A-Fa-f]{40})/i,
      postTxRegex = /^sendSignedTx:(0x[0-9A-Fa-f]{200,})/i,
      smsText = req.body.Body;

  switch(true){
      case balanceRegex.test(smsText):
         async function getBalance(address) {
             try {
               console.log('trying address ' + address);
               var balance = await etherscan.account.balance(address);
               console.log('balance = ' + balance['result']);
               var prettyBalance = balance['result'];
               prettyBalance /= Math.pow(10, 18);
               var balanceMessage = 'Balance for ' + address.substring(0,6) + ':\n' + prettyBalance.toFixed(6) + ' ether';
               sendText(balanceMessage, res );
               
             } catch (err) { throw new Error('err getting eth balance: ' + err); }
         }
         getBalance( RegExp.$1 );
         break;

      case nonceRegex.test(smsText):
         async function getNonce(address){
             try{
                 var nonce = await etherscan.proxy.eth_getTransactionCount( address, 'latest');
                 var nonceMessage = parseInt(nonce['result'], 16) + ' transactions sent from ' + address.substring(0,6);
                 sendText(nonceMessage, res );
             } catch (err) { throw new Error('err getting eth nonce: ' + err); }
         }
         getNonce( RegExp.$1 );
         break;

      case ethusdPriceRegex.test(smsText):
         async function getEthPrice(){
             try{
                 var ethPrice = await etherscan.stats.ethprice();
                 var ethusdMessage = '1 ETH = $' + ethPrice['result']['ethusd'] + ' USD';
                 sendText(ethusdMessage, res);
                 //console.log('ethprice data = ' + ethPrice);
             } catch (err) { throw new Error('err getting eth price: ' + err); }
         }
         getEthPrice();
         break;

      case gasPriceRegex.test(smsText):
         async function getGasPrice(){
             try{
                 var gasPrice = await etherscan.proxy.eth_gasPrice();
                 var gasPriceMessage = 'Current gas price is ' + parseInt(gasPrice['result'], 16) + ' wei';
                 sendText(gasPriceMessage, res);
             } catch (err) { throw new Error('err getting gas price: ' + err); }
         }
         getGasPrice();
         break;

/*      case lastFiveRegex.test(smsText):
         async function getLastFive(address){
             try{
                 var lastFive = await etherscan.account.txlist( address, 1, 'latest', 1, 1, 'asc');
                 sendText(lastFive['result'], res);
             } catch (err) { throw new Error('err getting last 5 TX: ' + err); }
         }
         getLastFive( RegExp.$1 );
         break;
*/
      case postTxRegex.test(smsText):
         async function postTransaction(signedData){
             try{
                 var txReceipt = await etherscan.proxy.eth_sendRawTransaction(signedData);
                 var receiptMessage = 'Transaction Hash:' + txReceipt['result'];
                 sendText(receiptMessage, res);
             } catch (err) { throw new Error('err getting last 5 TX: ' + err); }
         }
         postTransaction( RegExp.$1 );
         break;

      case helpRegex.test(smsText):
         message = 'Available Commands:\n\ncommands - show available commands\n\n' +
                   'balance:0xAccountNumber - get ethereum account balance\n\n' +
                   'nonce:0xAccountNumber - get account nonce\n\n' +
                   'eth2usd - get current ETH to USD conversion\n\n' +
                   'gasprice - get average gas price\n\n' +
//                   'last5tx:0xAccountNumber - get last 5 transactions info\n' +
                   'sendSignedTx:TransactionData - post a signed transaction';
         sendText(message, res);
         break;
     
      default:
         message = 'Invalid Command. \nText\"commands\" to get list of available commands';
         sendText(message, res);
  }

});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});

function sendText( myData, myRes ){
    console.log('sending text with data ' + myData);
    const twiml = new MessagingResponse();
    twiml.message(myData);

    myRes.writeHead(200, {'Content-Type': 'text/xml'});
    myRes.end(twiml.toString());
}
