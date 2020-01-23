const router = require('express').Router();

const registerDevice = require('./registerDevice');
const updateDevice = require('./updateDevice');

module.exports = () => {
  registerDevice(router);
  updateDevice(router);
  
  return router;
}