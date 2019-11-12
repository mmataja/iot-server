const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const Web3Utils = require('web3-utils');

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
	const reqData = req.body;
	const publicKey = await fs.readFileSync('./public.key', 'utf8');
	const dataToHash = JSON.stringify({
		deviceOwner: deviceFile.owner,
		deviceName: deviceFile.name,
		deviceFirmware: deviceFile.firmware,
		publicKey
	});
	
	
	const deviceSignature = Web3Utils.sha3(dataToHash);
	
	if (reqData.signature !== deviceSignature) {
		return res.status(422).send('Signatures doesn\'t match.');
	}
	
	const deviceData = { 
		...deviceFile,
		id: reqData.id,
		blockNumber: reqData.blockNumber,
		contractAddress: reqData.contractAddress,
	};
	
	
	await fs.writeFile('./deviceData.json', JSON.stringify(deviceData), error => {
		if (error) throw error;
	});
	
	return res.status(200).send("Device successfully registered.");
});


app.post('/update', (req, res) => {
	const data = req.body;
	const deviceData = { ...deviceFile};
	
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
	
	// TODO:
	// napraviti ovdje dekripciju podatka sa private key-em
	
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