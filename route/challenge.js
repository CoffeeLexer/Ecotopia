const express = require('express')
const multer  = require('multer')
const upload = multer({ dest: 'temporary/' })
const c_challenge = require('../controller/challenge/challenge')
const c_image = require('../controller/challenge/image')
const c_watchlist = require('../controller/challenge/bookmark')
const masterR = require('../masterRoutes')

const router = express.Router()

router.post('/create', c_challenge.create)
router.post(/\/list\/\d+/, c_challenge.list)
router.post('/list', c_challenge.list)
router.post('/edit', c_challenge.edit)
router.get(/\/image\/\d+/, c_image.get)
router.post(/\/image\/upload/, upload.any(), c_image.upload)

module.exports = router;