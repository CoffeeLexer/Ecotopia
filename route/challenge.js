const express = require('express')
const c_challenge = require('../controller/challenge/challenge')

const router = express.Router()

router.post('/create', c_challenge.create)
router.post('/details', c_challenge.details)
router.post('/edit', c_challenge.edit)
router.post('/feed', c_challenge.feed)

module.exports = router;