const { updateDevice } = require('../controllers')

module.exports = (router) => {
  router.post('/update', updateDevice);
}