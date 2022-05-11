const express = require('express')
const c_profile = require('../controller/profile/profile')
const multer  = require('multer')
const upload = multer({ dest: 'temporary/' })
const mastetRouter = require('../masterRoutes')

const router = express.Router()

router.post('/list', c_profile.list)
router.post(/\/list\/\d+/, c_profile.list)
router.get(/\/list\/\d+\/picture/, c_profile.getPicture)
router.post('', c_profile.profile)
router.post('/picture/set', mastetRouter.authenticate, upload.any(), c_profile.setProfilePicture)

module.exports = router;