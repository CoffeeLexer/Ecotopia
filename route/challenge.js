const express = require('express')
const multer  = require('multer')
const upload = multer({ dest: 'temporary/' })
const c_challenge = require('../controller/challenge/challenge')
const c_image = require('../controller/challenge/image')
const c_watchlist = require('../controller/challenge/bookmark')
const masterR = require('../masterRoutes')
const mastetRouter = require("../masterRoutes");

const router = express.Router()

router.post('/create', mastetRouter.authenticate, c_challenge.create)
router.post(/\/list\/\d+/, mastetRouter.authenticate, c_challenge.list)
router.post(/\/delete\/\d+/, mastetRouter.authenticate, c_challenge.drop)
router.post('/list', mastetRouter.authenticate, c_challenge.list)
router.post('/edit', mastetRouter.authenticate, c_challenge.edit)
router.get(/\/image\/\d+/, mastetRouter.authenticate, c_image.get)
router.post(/\/image\/upload/, mastetRouter.authenticate, upload.any(), c_image.upload)

module.exports = router;