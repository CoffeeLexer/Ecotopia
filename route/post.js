const express = require('express')
const c_post = require('../controller/post/post')
const masterRoutes = require('../masterRoutes')

const router = express.Router()

router.post(/\/create/, masterRoutes.authenticate, c_post.create)
router.post(/\/list/, c_post.list)
router.post(/\/list\/\d+/, c_post.list)

module.exports = router;