import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "./../../utils/cloud.js";
import { Category } from "./../../../DB/models/category.model.js";
import slugify from "slugify";

export const createCategory = asyncHandler(async (req, res, next) => {
  // check file
  if (!req.file)
    return next(new Error("Category image is required!", { cause: 400 }));

  // upload image in cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.CLOUD_ROOT_FOLER}/category` }
  );

  // create category
  await Category.create({
    name: req.body.name, // mobile phones
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
    slug: slugify(req.body.name), // mobile-phones
  });

  // response
  return res
    .status(201)
    .json({ success: true, message: "Category created successfully!" });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.id);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check owner
  if (category.createdBy.toString() !== req.user._id.toString())
    return next(new Error("Not authorized to uodate the category!"));

  // check file
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { public_id: category.image.id }
    );

    category.image = { id: public_id, url: secure_url };
  }

  // update category
  category.name = req.body.name ? req.body.name : category.name;
  category.slug = req.body.name ? slugify(req.body.name) : category.slug;

  // save category
  await category.save();

  // response
  return res.json({ success: true, message: "Category updated successfully!" });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.id);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check owner
  if (category.createdBy.toString() !== req.user._id.toString())
    return next(new Error("Not authorized to delete the category!"));

  // delete category
  await category.deleteOne();

  // delete image
  await cloudinary.uploader.destroy(category.image.id);

  return res.json({ success: true, message: "category deleted successfully!" });
});

export const allCategories = asyncHandler(async (req, res, next) => {
  const results = await Category.find().populate([
    {
      path: "subcategory",
    },
    {
      path: "createdBy",
    },
  ]);

  console.log(results);
  return res.json({ success: true, results });
});
