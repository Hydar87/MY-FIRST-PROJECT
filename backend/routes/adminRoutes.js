const express = require("express");
const { ensureAuthenticated} = require("../middleware/authenticate");
const { authorize} = require("../middleware/authorize");

const {
    getAllUsers,
    getUserById
} = require("../controllers/adminController")

const router = express.Router();

router.get("/getUsersProfile/read",ensureAuthenticated, authorize("users:read"), getAllUsers );

router.get("/users/:public_id", ensureAuthenticated, authorize("users:read"), getUserById);

module.exports = router;
