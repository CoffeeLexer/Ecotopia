const express = require('express')
const c_resource = require('../controller/resource/resource')
const mastetRouter = require("../masterRoutes");

const router = express.Router()

router.post(/\/set\/\d+/, mastetRouter.authenticate, c_resource.set)

module.exports = router;