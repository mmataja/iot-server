const { registerDevice } = require('../controllers')

module.exports = (router) => {
  router.post('/register', registerDevice);
}