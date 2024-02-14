import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "./../../utils/cloud.js";
import { Category } from "./../../../DB/models/category.model.js";
import slugify from "slugify";
import { Subcategory } from "./../../../DB/models/subcategory.model.js";

export const createSubcategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check file
  if (!req.file)
    return next(new Error("Subcategory image is required!", { cause: 400 }));

  // upload image in cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.CLOUD_ROOT_FOLER}/subcategory` }
  );

  // create subcategory
  await Subcategory.create({
    name: req.body.name, // mobile phones
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
    slug: slugify(req.body.name), // mobile-phones
    category: category._id,
  });

  // response
  return res
    .status(201)
    .json({ success: true, message: "Subcategory created successfully!" });
});

export const updateSubcategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check subcategory
  const subcategory = await Subcategory.findOne({
    _id: req.params.id,
    category: req.params.category,
  });
  if (!subcategory)
    return next(new Error("subcategory not found!", { cause: 404 }));

  // check owner
  if (subcategory.createdBy.toString() !== req.user._id.toString())
    return next(new Error("Not authorized to update the subcategory!"));

  // check file
  if (req.file) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.file.path,
      { public_id: subcategory.image.id }
    );

    subcategory.image = { id: public_id, url: secure_url };
  }

  // update category
  subcategory.name = req.body.name ? req.body.name : subcategory.name;
  subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;

  // save subcategory
  await subcategory.save();

  // response
  return res.json({
    success: true,
    message: "Subategory updated successfully!",
  });
});

export const deleteSubcategory = asyncHandler(async (req, res, next) => {
  // check category
  const category = await Category.findById(req.params.category);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));

  // check subcategory
  const subcategory = await Subcategory.findOne({
    _id: req.params.id,
    category: req.params.category,
  });
  if (!subcategory)
    return next(new Error("subcategory not found!", { cause: 404 }));

  // check owner
  if (subcategory.createdBy.toString() !== req.user._id.toString())
    return next(new Error("Not authorized to delete the subcategory!"));

  // delete category
  await subcategory.deleteOne();

  // delete image
  await cloudinary.uploader.destroy(subcategory.image.id);

  return res.json({
    success: true,
    message: "subcategory deleted successfully!",
  });
});

export const allSubcategories = asyncHandler(async (req, res, next) => {
  if (req.params.category !== undefined) {
    // check category
    const category = await Category.findById(req.params.category);
    if (!category)
      return next(new Error("Category not found!", { cause: 404 }));

    const results = await Subcategory.find({ category: req.params.category });
    return res.json({ success: true, results });
  }

  // // multiple populate
  // const subcategories = await Subcategory.find().populate([
  //   {
  //     path: "category",
  //     select: "name -_id",
  //   },
  //   {
  //     path: "createdBy",
  //     select: "email",
  //   },
  // ]);

  // nested populate
  const subcategories = await Subcategory.find().populate([
    {
      path: "category",
      populate: { path: "createdBy" },
      select: "name",
    },
    {
      path: "createdBy",
    },
  ]);
  return res.json({ success: true, results: { subcategories } });
});
