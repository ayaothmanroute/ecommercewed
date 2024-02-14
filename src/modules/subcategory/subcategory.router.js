import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utils/fileUpload.js";
import * as subcategorySchema from "./subcategory.schema.js";
import * as subcategoryController from "./subcategory.controller.js";
import { validation } from "../../middleware/validation.middlware.js";
const router = Router({ mergeParams: true });

// http://localhost:3000/category/64619656561/subcategory/ >>> Post

// create subcategory
router.post(
  "/",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("subcategory"),
  validation(subcategorySchema.createSubcategory),
  subcategoryController.createSubcategory
);

// update subcategory
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  fileUpload().single("subcategory"),
  validation(subcategorySchema.updateSubcategory),
  subcategoryController.updateSubcategory
);

// delete subcategory
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("admin"),
  validation(subcategorySchema.deleteSubcategory),
  subcategoryController.deleteSubcategory
);

// get all subcategories
router.get("/", subcategoryController.allSubcategories);

export default router;
