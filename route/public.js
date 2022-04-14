const express = require('express')
const c_email = require('../controller/public/email')
const c_tag = require('../controller/public/tag')
const c_account = require('../controller/public/account')

const router = express.Router()

router.post('/email', c_email.exists)
router.post('/tags', c_tag.index)
router.post('/register', c_account.register)
router.post('/login', c_account.login)
router.post('/logout', c_account.logout)
router.post('/profile', c_account.profile)

module.exports = router;