const { registerDevice } = require('../services');

module.exports = async (req, res) => {
  const { encryptData } = req.body;

  const isRegister = await registerDevice(encryptData);
  
  if (!isRegister) {
    return res.status(422).send('Signatures does not match.');
  }
	
	return res.status(200).send("Device successfully registered.");
}
