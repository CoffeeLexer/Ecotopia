const express = require('express')
const c_meeting = require('../controller/execution/execution')
const c_chat = require('../controller/execution/chat')
const masterRoutes = require('../masterRoutes')
const mastetRouter = require("../masterRoutes");

const router = express.Router()

router.post('/create', mastetRouter.authenticate, c_meeting.create, c_meeting.list)
router.post('/leave', mastetRouter.authenticate, c_meeting.leave)
router.post(/\/list\/\d+\/chat\/list\/\d+/, masterRoutes.authenticate, c_chat.list)
router.post(/\/list\/\d+\/chat\/list/, masterRoutes.authenticate, c_chat.list)
router.post(/\/list\/\d+/, c_meeting.list)
router.post('/list', c_meeting.list)

module.exports = router;