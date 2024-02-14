import joi from "joi";
import { isValidObjectId } from "../../middleware/validation.middlware.js";

export const createSubcategory = joi
  .object({
    name: joi.string().min(5).max(20).required(),
    category: joi.string().custom(isValidObjectId).required(),
  })
  .required();

export const updateSubcategory = joi
  .object({
    name: joi.string().min(5).max(20),
    category: joi.string().custom(isValidObjectId).required(),
    id: joi.string().custom(isValidObjectId).required(), // subcategory
  })
  .required();

export const deleteSubcategory = joi
  .object({
    category: joi.string().custom(isValidObjectId).required(),
    id: joi.string().custom(isValidObjectId).required(), // subcategory
  })
  .required();
