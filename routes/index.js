const router = require('express').Router();

const registerDevice = require('./registerDevice');

module.exports = () => {
  registerDevice(router);
  
  return router;
}