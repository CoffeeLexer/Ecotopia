const express = require('express')
const c_profile = require('../controller/profile/profile')

const router = express.Router()

router.post('/list', c_profile.list)
router.post(/\/list\/\d+/, c_profile.list)

module.exports = router;