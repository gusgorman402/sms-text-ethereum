# eth-denver
ETHDenver Project

## How To Run

### To Start
Replace `.env-example` values with real twilio and etherscan secrets. Also, rename to `.env` so it wouldn't ever get committed.


### Build Dependencies
```
cd eth-denver
npm install
```

### Run Server
```
node server.js
```

### Run Reverse Proxy
```
twilio phone-numbers:update "+10000000000" --sms-url="http://localhost:1337/sms"
```
where `+10000000000` is your twilio phone number you've entered in the `.env` file.
