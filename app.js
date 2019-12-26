const NodeRSA = require('node-rsa');
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');

const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(
	Web3.currentProvider || Web3.givenProvider || 'http://127.0.0.1:7545'));

const ethUtil = require('ethjs-util');
	
const PORT = process.env.PORT || 3030;
const app = express();

let deviceFile;
fs.readFile('./deviceData.json', 'utf8', (error, data) => {
	if (error) {
		console.log('Error reading file from the disk:', error);
		return;
	}
	try {
		deviceFile = JSON.parse(data);
	} catch (err) {
		console.log('Error parsing JSON string:', err); 
	}
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/*
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});
*/
/*
var routes = require('./routes/iotRoutes');
routes(app);
*/
app.get('/', (req, res) => {
	console.log(deviceFile);
	res.send("hello");
});

app.post('/register', async (req, res) => {
	const { encryptData } = req.body;

	const privateKey = await fs.readFileSync('./private.key', 'utf8');
	const key = new NodeRSA(privateKey);
	const decryptData = JSON.parse(key.decrypt(encryptData, 'utf8'));

	const deviceDataToSign = {
		deviceOwner: deviceFile.owner,
		deviceName: deviceFile.name,
		deviceFirmware: deviceFile.firmware,
		account: decryptData.account,
	};

	const deviceSign = await web3.eth.accounts.sign(JSON.stringify(deviceDataToSign), decryptData.account);

	if (deviceSign.signature !== decryptData.signature) {
		return res.status(400).send('Signatures does not match.');
	}

	const deviceData = JSON.stringify({
		name: deviceDataToSign.deviceName,
		owner: deviceDataToSign.deviceOwner,
		firmware: deviceDataToSign.deviceFirmware,
		id: decryptData.id,
		blockNumber: decryptData.blockNumber,
		contractId: decryptData.contract,
	});

	fs.writeFile('./deviceData.json', deviceData, error => {
		if (error) throw error;
	});
	
	return res.status(200).send("Device successfully registered.");
});


app.post('/update', (req, res) => {
	const data = req.body;
	const deviceData = { ...deviceFile };
	
	if (Object.entries(data).length === 0 && data.constructor === Object) {
		return res.status(422).send("Invalid argument exception, no information provided.");
	}
	
	if (Object.entries(data).length !== Object.entries(deviceFile).length) {
		return res.status(422).send("Invalid data provided.");
	}
	
	Object.keys(deviceFile).map( key => {
		if (!(key in data)) {
			return res.status(422).send("Invalid data provided.");
		}
		
		deviceData[key] = data[key]; 
	})
	
	fs.writeFile('./deviceData.json', JSON.stringify(deviceData), error => {
		if (error) throw error;
		console.log("Data replaced");
	})
	
	return res.status(200).send(deviceData);
});

app.get((req, res) => {
	res.type('text/plain');
	res.status(505);
	res.send('Error page');
});



app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
