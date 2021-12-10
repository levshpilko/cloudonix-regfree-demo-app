const express = require('express');

const controllers = require('../controllers/controllers');

const router = express.Router();

//routes for /api/
router.post('/register', controllers.register);
router.post('/receive-call', controllers.receiveCall);

router.get('/call', controllers.getCallerData);

module.exports = router;
