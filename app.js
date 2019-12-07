const NodeRSA = require('node-rsa');
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');

const Personal = require('web3-eth-personal');
const personal = new Personal('http://127.0.0.1:7545');

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

	console.log("Decrypt DATA.....", decryptData.account);
	console.log("DEVICE FILE....", deviceFile);

	// const selectedWalletAddress = await web3.eth.getAccounts();

	const dataThatWasSigned = {
		deviceOwner: deviceFile.owner,
		deviceName: deviceFile.name,
		deviceFirmware: deviceFile.firmware,
		account: decryptData.account,
	};
	console.log("DATA THAT WAS SIGNED...", dataThatWasSigned);

	const testWeb3 = await personal.ecRecover(JSON.stringify(dataThatWasSigned), decryptData.signature);
	console.log(testWeb3);

	// const accountThatSignedTheMessage = await web3.eth.personal.ecRecover(dataThatWasSigned, decryptData.signature).then((data) => console.log(data));
	// console.log(accountThatSignedTheMessage);
	
	// if (accountThatSignedTheMessage !== decryptData.account) {
	// 	return res.status(422).send('Signatures doesn\'t match.');
	// }
	
	const deviceData = { 
		...dataThatWasSigned,
		id: decryptData.id,
		blockNumber: decryptData.blockNumber,
		contractId: decryptData.contract,
	};

	console.log("DEVICE DATA....", deviceData);
	
	
	// await fs.writeFile('./deviceData.json', JSON.stringify(deviceData), error => {
	// 	if (error) throw error;
	// });
	
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