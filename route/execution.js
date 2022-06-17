const express = require('express')
const c_execution = require('../controller/execution/execution')
const c_chat = require('../controller/execution/chat')
const masterRoutes = require('../masterRoutes')
const mastetRouter = require("../masterRoutes");

const router = express.Router()

router.post('/create', mastetRouter.authenticate, c_execution.create, c_execution.list)
router.post(/\/list\/\d+\/chat\/list\/\d+/, masterRoutes.authenticate, c_chat.list)
router.post(/\/list\/\d+\/chat\/list/, masterRoutes.authenticate, c_chat.list)
router.post(/\/list\/\d+/, masterRoutes.authenticate, c_execution.list)
router.post('/list', masterRoutes.authenticate, c_execution.list)
router.post(/\/join/, masterRoutes.authenticate, c_execution.join)
router.post(/\/leave/, masterRoutes.authenticate, c_execution.leave)
router.post(/\/invite/, masterRoutes.authenticate, c_execution.invite)

module.exports = router;