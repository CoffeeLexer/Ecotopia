const express = require('express')
const c_meeting = require('../controller/meeting/meeting')
const c_chat = require('../controller/meeting/chat')
const masterRoutes = require('../masterRoutes')

const router = express.Router()

router.post('/create', c_meeting.create)
router.post('/join', c_meeting.join)
router.post('/leave', c_meeting.leave)
router.post(/\/list\/\d+\/chat\/list\/\d+/, masterRoutes.authenticate, c_chat.list)
router.post(/\/list\/\d+\/chat\/list/, masterRoutes.authenticate, c_chat.list)
router.post(/\/list\/\d+/, c_meeting.list)
router.post('/list', c_meeting.list)

module.exports = router;