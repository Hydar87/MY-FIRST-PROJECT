const express = require("express");
const router = express.Router();

const { validate } = require("../middleware/validate");

const {
    stkPush,
    mpesaCallback,
} = require("../controllers/mpesa")

const {
    stkPushSchema,
    mpesaCallbackSchema,
    } = require("../validations/mpesaValidation");

router.post("/stk-push", validate(stkPushSchema), stkPush);
router.post("/callback", validate(mpesaCallbackSchema), mpesaCallback);

module.exports = router;
