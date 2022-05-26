const express = require('express')
const c_profile = require('../controller/profile/profile')
const multer  = require('multer')
const upload = multer({ dest: 'temporary/' })
const mastetRouter = require('../masterRoutes')

const router = express.Router()

router.post('/list', mastetRouter.authenticate, c_profile.list)
router.post(/\/list\/\d+/, mastetRouter.authenticate, c_profile.list)
router.get(/\/list\/\d+\/picture/, mastetRouter.authenticate, c_profile.getPicture)
router.get(/\/list\/\d+\/banner/,  mastetRouter.authenticate,c_profile.getBanner)
router.post('', mastetRouter.authenticate, c_profile.profile)
router.post('/picture/set', mastetRouter.authenticate, upload.any(), c_profile.setProfilePicture)
router.post('/banner/set', mastetRouter.authenticate, upload.any(), c_profile.setProfileBanner)

module.exports = router;