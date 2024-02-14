import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middlware.js";

export const addReview = joi
  .object({
    productId: joi.string().custom(isValidObjectId).required(),
    comment: joi.string().required(),
    rating: joi.number().min(1).max(5).required(),
  })
  .required();

export const updateReview = joi
  .object({
    productId: joi.string().custom(isValidObjectId).required(),
    id: joi.string().custom(isValidObjectId).required(),
    comment: joi.string(),
    rating: joi.number().min(1).max(5),
  })
  .required();
