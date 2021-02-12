const express = require('express');
const { routes } = require('./accounts');
const router = express.Router();

router.use('/', routes);

module.exports = router;
