const express = require('express')
const c_notification = require('../controller/notification/notification')
const masterRoutes = require('../masterRoutes')

const router = express.Router()

router.post('/add', c_notification.add)
router.post('/list', masterRoutes.authenticate, c_notification.list)
router.post(/\/list\/\d+/, masterRoutes.authenticate, c_notification.list)

module.exports = router;