const Joi = require("joi");

const stkPushSchema = Joi.object({
  phoneNumber: Joi.string()
    .trim()
    .pattern(/^(\+254|254|0)(7|1)\d{8}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Invalid Kenyan phone number",
      "any.required": "Phone number is required",
    }),

  amount: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "Amount must be a number",
      "number.min": "Amount must be greater than zero",
      "any.required": "Amount is required",
    }),
});

const callbackItemSchema = Joi.object({
  Name: Joi.string().required(),
  Value: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
});

const stkCallbackSchema = Joi.object({
  MerchantRequestID: Joi.string().trim().required(),
  CheckoutRequestID: Joi.string().trim().required(),
  ResultCode: Joi.number().integer().required(),
  ResultDesc: Joi.string().required(),
  CallbackMetadata: Joi.object({
    Item: Joi.array().items(callbackItemSchema).min(1).required(),
  }).when("ResultCode", {
    is: 0,
    then: Joi.required(),
    otherwise: Joi.optional().allow(null),
  }),
}).required();

const mpesaCallbackSchema = Joi.object({
  Body: Joi.object({
    stkCallback: stkCallbackSchema,
  }).required(),
});

module.exports = {
  stkPushSchema,
  mpesaCallbackSchema,
};