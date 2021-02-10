const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

router.post('/back', (req, res) => {
    console.log('req.body.Body', req.body.Body);
    const smsReply = req.body.Body;
    const twiml = new MessagingResponse();
    twiml.message('You typed ' + smsReply);
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});

module.exports = router;

