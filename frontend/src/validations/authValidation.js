import Joi from "joi";

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
    "string.pattern.base": "Password must contain at least one letter and one number",
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

// Email schema
const emailSchema = Joi.string()
  .trim()
  .email({ tlds: { allow: false } }) // Prevents issues with strict browser TLD checks
  .required()
  .messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email",
    "any.required": "Email is required",
  });

// Username schema
const usernameSchema = Joi.string()
  .trim()
  .min(2)
  .max(100)
  .required()
  .messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  });

// Verification code schema (Exported in case you need it in a 2FA/OTP page)
export const verificationCodeSchema = Joi.string()
  .pattern(/^\d{6}$/)
  .required()
  .messages({
    "string.empty": "Verification code is required",
    "string.pattern.base": "Verification code must be exactly 6 digits",
    "any.required": "Verification code is required",
  });

// Registration schema
export const registerSchema = Joi.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
});

// Helper function to call directly inside RegisterPage.jsx
export const validateRegisterInput = (formData) => {
  const { error } = registerSchema.validate(formData, { abortEarly: false });

  if (!error) {
    return { isValid: true, errors: {} };
  }

  // Convert Joi error details into key-value map for form fields
  const errors = {};
  error.details.forEach((detail) => {
    const key = detail.path[0];
    if (!errors[key]) {
      errors[key] = detail.message;
    }
  });

  return { isValid: false, errors };
};