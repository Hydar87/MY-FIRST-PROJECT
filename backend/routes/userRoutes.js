const express = require("express");
const { ensureAuthenticated} = require("../middleware/authenticate");
const { authorize} = require("../middleware/authorize");

const {getProfile} = require("../controllers/userController")

const router = express.Router();

router.get("/profile/read", ensureAuthenticated, authorize("profile:read"), getProfile );

module.exports = router;
