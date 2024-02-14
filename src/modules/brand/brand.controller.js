import { asyncHandler } from "../../utils/asyncHandler.js";
import { Category } from "./../../../DB/models/category.model.js";
import cloudinary from "./../../utils/cloud.js";
import { Brand } from "./../../../DB/models/brand.model.js";
import slugify from "slugify";

export const createBrand = asyncHandler(async (req, res, next) => {
  // check categories
  const { categories, name } = req.body;
  categories.forEach(async (categoryId) => {
    const categroy = await Category.findById(categoryId);
    if (!categroy)
      return next(new Error("Category not found!", { cause: 404 }));
  });
  // file
  if (!req.file) return next(new Error("File is required!", { cause: 400 }));

  // upload in cloud
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.CLOUD_ROOT_FOLER}/brands` }
  );
  // save brand
  const brand = await Brand.create({
    name,
    slug: slugify(name),
    createdBy: req.user._id,
    image: { id: public_id, url: secure_url },
  });
  // save brand in each category
  categories.forEach(async (categoryId) => {
    await Category.findByIdAndUpdate(categoryId, {
      $push: { brands: brand._id },
    });
  });
  // response
  return res.json({ success: true, message: "Brand created successfully!" });
});

export const updateBrand = asyncHandler(async (req, res, next) => {
  // check brand
  const brand = await Brand.findById(req.params.id);
  if (!brand) return next(new Error("Brand not found!", { cause: 404 }));
  // check file
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: brand.image.id,
      }
    );

    brand.image = { url: secure_url, id: public_id };
  }
  // name slug
  brand.name = req.body.name ? req.body.name : brand.name;
  brand.slug = req.body.name ? slugify(req.body.name) : brand.slug;
  // save
  await brand.save();
  // response
  return res.json({ success: true, message: "Brand updated successfully!" });
});

export const deleteBrand = asyncHandler(async (req, res, next) => {
  // check brand + delete
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) return next(new Error("Brand not found!", { cause: 404 }));

  // delete image
  await cloudinary.uploader.destroy(brand.image.id);

  // delete brand from categories
  await Category.updateMany({}, { $pull: { brands: brand._id } });

  // response
  return res.json({ success: true, message: "brand deleted successfully!" });
});

export const getBrand = asyncHandler(async (req, res, next) => {
  const brands = await Brand.find();
  return res.json({ success: true, results: { brands } });
});
