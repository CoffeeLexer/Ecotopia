const express = require('express')
const c_meeting = require('../controller/meeting/meeting')

const router = express.Router()

router.post('/create', c_meeting.create)
router.post('/join', c_meeting.join)
router.post('/leave', c_meeting.leave)
router.post('/list', c_meeting.list)
router.post(/\/list\/\d+/, c_meeting.list)

module.exports = router;