const Joi = require("joi");

// Password schema
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
  .required()
  .messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password cannot exceed 128 characters",
    "string.pattern.base":
      "Password must contain at least one letter and one number",
    "any.required": "Password is required",
  });

// Password confirmation schema
const confirmPasswordSchema = Joi.any()
  .valid(Joi.ref("password"))
  .required()
  .messages({
    "any.only": "Passwords do not match",
    "any.required": "Passwords do not match",

  });

  const emailSchema = Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email",
      "any.required": "Email is required"
    })

    const usernameSchema =  Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 100 characters",
      "any.required": "Name is required",
    })

    const verificationCodeSchema = Joi.string()
  .pattern(/^\d{6}$/)
  .required()
  .messages({
    "string.empty": "Verification code is required",
    "string.pattern.base": "Verification code must be exactly 6 digits",
    "any.required": "Verification code is required",
  });
// Registration schema
const registerSchema = Joi.object({
  
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
});

const resendVerificationSchema= Joi.object({
      email: emailSchema,

})
  const verifyEmailSchema = Joi.object({
    email: emailSchema,
    code: verificationCodeSchema,
  });

 const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Invalid email or password",
      "any.required": "Invalid email or password",
    }),

  password: passwordSchema
  .messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
    "string.min": "Invalid email or password",
    "string.max": "Invalid email or password",
    "string.pattern.base": "Invalid email or password",
  }),
});
  // Reset password schema
const resetPasswordSchema = Joi.object({
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
});

const resendForgotPasswordSchema = Joi.object({
  email: emailSchema,
});

const forgotPasswordSchema= Joi.object({
    email: emailSchema,
})

const verifypassCodeSchema = Joi.object({
    email: emailSchema,    
    code: verificationCodeSchema,
})

const verifyFogotpasswordSchema = Joi.object({
    email: emailSchema,
    code: verificationCodeSchema,
    password :  passwordSchema,
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({ 'any.only': 'Passwords do not match' }),
})

const passwordChangeSchema = Joi.object({
  currentPassword: passwordSchema
  .messages({
    "string.empty": "Current Password is required",
    "any.required": "Current Password is required",
    "string.min": "Invalid password",
    "string.max": "Invalid password",
    "string.pattern.base": "Invalid password",
  }),

  newPassword: passwordSchema
    .invalid(Joi.ref("currentPassword"))
    .messages({
      "any.invalid": "New password must be different from current password",
      "string.empty": "New Password is required",
      "any.required": "New Password is required",
    }),

  confirmNewPassword: Joi.string()
    .required()
    .valid(Joi.ref('newPassword')) // Ensures confirm matches newPassword
    .messages({
      "string.empty": "Please confirm your new password",
      "any.required": "Please confirm your new password",
      "any.only": "Passwords do not match",
    }),
});



module.exports = {
  registerSchema,
  verifyEmailSchema,
  loginSchema,
  passwordChangeSchema,
  resendForgotPasswordSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  resendVerificationSchema,
  verifyFogotpasswordSchema,
  verifypassCodeSchema,
 
};

