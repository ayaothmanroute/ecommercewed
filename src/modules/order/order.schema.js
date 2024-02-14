import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middlware.js";

export const createOrder = joi
  .object({
    payment: joi.string().valid("cash", "visa"),
    phone: joi.string().required(),
    address: joi.string().required(),
    coupon: joi.string(),
  })
  .required();

export const cancelOrder = joi
  .object({
    id: joi.string().custom(isValidObjectId).required(),
  })
  .required();
