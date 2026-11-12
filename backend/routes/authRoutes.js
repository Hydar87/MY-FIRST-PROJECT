const express = require("express");
const router = express.Router();

const { 
    register, 
    resendVerification, 
    verifyEmail, 
    login,
    refreshToken,
    forgotPassword,
    verifypassCode,
    verifyFogotpassword,
    changePassword,
    logout,
} = require("../controllers/authController");
const { 
    registerSchema,
    resendVerificationSchema,
    verifyEmailSchema,
    loginSchema,
    forgotPasswordSchema,
    verifypassCodeSchema,
    verifyFogotpasswordSchema,
    passwordChangeSchema,
} = require("../validations/authValidation");
const { validate} = require("../middleware/validate");
const { ensureAuthenticated} = require("../middleware/authenticate");

const { authLimiter, sensitiveActionLimiter } = require("../config/apiLimiter");

router.post("/register",authLimiter, validate(registerSchema), register );
router.post("/login",authLimiter, validate(loginSchema), login);

router.post( "/resend-verification",sensitiveActionLimiter, validate(resendVerificationSchema), resendVerification );
router.post("/forget" ,sensitiveActionLimiter, validate(forgotPasswordSchema), forgotPassword);

router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/refresh" ,refreshToken);
router.post("/verifycode", validate(verifypassCodeSchema), verifypassCode);
router.post("/verifyFogotpass", validate(verifyFogotpasswordSchema),verifyFogotpassword );
router.post("/change-password", validate(passwordChangeSchema),ensureAuthenticated, changePassword);
router.post("/logout", ensureAuthenticated, logout); 


module.exports = router;