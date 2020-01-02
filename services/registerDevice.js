const NodeRSA = require('node-rsa');
const fs = require('fs');
const path = require('path');

const deviceFile = require('../deviceData.json');
const { web3 } = require('../utils');

module.exports = async (encryptData) => {
  const privateKey = fs.readFileSync(path.resolve('./private.key'), 'utf8');
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
		return false;
  }
  
	const deviceData = JSON.stringify({
		name: deviceDataToSign.deviceName,
		owner: deviceDataToSign.deviceOwner,
		firmware: deviceDataToSign.deviceFirmware,
		id: decryptData.id,
		blockNumber: decryptData.blockNumber,
		contractId: decryptData.contract,
  });
  
  fs.writeFileSync(path.resolve('./deviceData.json'), deviceData, { encoding: 'utf8'});
  
  return true;
}