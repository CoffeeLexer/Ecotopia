const masterR = require("../masterRoutes");
const c_bookmark = require("../controller/challenge/bookmark");
const express = require("express");

const router = express.Router()

router.post(/\/add\/\d+/, masterR.authenticate, c_bookmark.add)
router.post(/\/is_bookmarked\/\d+/, masterR.authenticate, c_bookmark.get)
router.post(/\/remove\/\d+/, masterR.authenticate, c_bookmark.remove)
router.post(/\/list/, masterR.authenticate, c_bookmark.getAll)

module.exports = router;