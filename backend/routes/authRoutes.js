const express = require("express");

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


const router = express.Router();

router.post("/register", validate(registerSchema), register );
router.post( "/resend-verification", validate(resendVerificationSchema), resendVerification );
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post("/refresh" ,refreshToken);
router.post("/forget" ,validate(forgotPasswordSchema), forgotPassword);
router.post("/verifycode", validate(verifypassCodeSchema), verifypassCode);
router.post("/verifyFogotpass", validate(verifyFogotpasswordSchema),verifyFogotpassword );
router.post("/change-password", validate(passwordChangeSchema),ensureAuthenticated, changePassword);
router.post("/logout", ensureAuthenticated, logout); 


module.exports = router;