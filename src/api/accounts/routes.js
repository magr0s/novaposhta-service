const express = require('express');
const AccountController = require('./controller');

const router = express.Router();

router.get('/cron', (req, res) => AccountController.cron(req, res));

router.post('/add', (req, res) => AccountController.add(req, res));
router.delete('/delete', (req, res) => AccountController.delete(req, res));
router.patch('/start', (req, res) => AccountController.start(req, res));
router.patch('/stop', (req, res) => AccountController.stop(req, res));

module.exports = router;
