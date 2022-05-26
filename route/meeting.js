const express = require('express')
const c_meeting = require('../controller/meeting/meeting')
const masterRoutes = require('../masterRoutes')
const mastetRouter = require("../masterRoutes");

const router = express.Router()

router.post('/create', mastetRouter.authenticate, c_meeting.create)
router.post(/\/list\/\d+/, c_meeting.list)
router.post('/list', c_meeting.list)

module.exports = router;