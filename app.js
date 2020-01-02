const bodyParser = require('body-parser');
const express = require('express');

const routes = require('./routes');

const PORT = process.env.PORT || 3030;

const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.post('/update', (req, res) => {
// 	const data = req.body;
// 	const deviceData = { ...deviceFile };
	
// 	if (Object.entries(data).length === 0 && data.constructor === Object) {
// 		return res.status(422).send("Invalid argument exception, no information provided.");
// 	}
	
// 	if (Object.entries(data).length !== Object.entries(deviceFile).length) {
// 		return res.status(422).send("Invalid data provided.");
// 	}
	
// 	Object.keys(deviceFile).map( key => {
// 		if (!(key in data)) {
// 			return res.status(422).send("Invalid data provided.");
// 		}
		
// 		deviceData[key] = data[key]; 
// 	})
	
// 	fs.writeFile('./deviceData.json', JSON.stringify(deviceData), error => {
// 		if (error) throw error;
// 		console.log("Data replaced");
// 	})
	
// 	return res.status(200).send(deviceData);
// });

app.use('/', routes());

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
