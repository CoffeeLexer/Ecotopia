const express = require('express')
const c_claim = require('../controller/claim/claim')
const c_image = require('../controller/claim/image')
const masterRoutes = require('../masterRoutes')

const multer  = require('multer')
const upload = multer({ dest: 'temporary/' })

const router = express.Router()

router.post(/\/create/, masterRoutes.authenticate, c_claim.create)
router.post(/\/image\/upload/, masterRoutes.authenticate, upload.any(), c_image.upload)
router.get(/\/image\/\d+/, masterRoutes.authenticate, c_image.get)

module.exports = router;