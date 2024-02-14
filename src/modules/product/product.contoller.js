import { asyncHandler } from "./../../utils/asyncHandler.js";
import { Category } from "./../../../DB/models/category.model.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { Brand } from "./../../../DB/models/brand.model.js";
import { nanoid } from "nanoid";
import cloudinary from "./../../utils/cloud.js";
import { Product } from "./../../../DB/models/product.model.js";

export const createProduct = asyncHandler(async (req, res, next) => {
  //category
  const category = await Category.findById(req.body.category);
  if (!category) return next(new Error("Category not found!", { cause: 404 }));
  //subcategory
  const subcategory = await Subcategory.findById(req.body.subcategory);
  if (!subcategory)
    return next(new Error("subcategory not found!", { cause: 404 }));
  //brand
  const brand = await Brand.findById(req.body.brand);
  if (!brand) return next(new Error("brand not found!", { cause: 404 }));

  // check files
  if (!req.files)
    return next(new Error("product images are required!", { cause: 400 }));
  // create unqiue folder name for each product
  const cloudFolder = nanoid();

  // req.files >>>  {}
  // upload subimages
  const images = [];
  for (const file of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `${process.env.CLOUD_ROOT_FOLER}/products/${cloudFolder}` }
    );
    images.push({ id: public_id, url: secure_url });
  }

  // upload defaultimage
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.defaultImage[0].path,
    { folder: `${process.env.CLOUD_ROOT_FOLER}/products/${cloudFolder}` }
  );

  // create product

  const product = await Product.create({
    ...req.body,
    cloudFolder,
    createdBy: req.user._id,
    images,
    defaultImage: { id: public_id, url: secure_url },
  });

  // resposne
  return res.status(201).json({ success: true, results: { product } });
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  // check product
  const product = await Product.findById(req.params.id);
  if (!product) return next(new Error("Invalid product id!", { cause: 404 }));

  // check owner
  if (product.createdBy.toString() != req.user.id)
    return next(new Error("Not Authorized!", { cause: 403 }));

  // delete product -- from database
  await product.deleteOne();

  // delete images -- from cloud
  // const ids = product.images.map((image) => image.id);
  // ids.push(product.defaultImage.id);
  // await cloudinary.api.delete_resources(ids);

  await cloudinary.api.delete_resources_by_prefix(
    `${process.env.CLOUD_ROOT_FOLER}/products/${product.cloudFolder}`
  );

  // delete folder
  await cloudinary.api.delete_folder(
    `${process.env.CLOUD_ROOT_FOLER}/products/${product.cloudFolder}`
  );

  // response
  return res.json({ success: true, message: "product deleted successfully!" });
});

export const allProducts = asyncHandler(async (req, res, next) => {
  let { category, subcategory, brand, sort, page, keyword } = req.query;
  //category
  if (category && !(await Category.findById(req.body.category)))
    return next(new Error("Category not found!", { cause: 404 }));
  //subcategory
  if (subcategory && !(await Subcategory.findById(req.body.subcategory)))
    return next(new Error("subcategory not found!", { cause: 404 }));
  //brand
  if (brand && !(await Brand.findById(req.body.brand)))
    return next(new Error("brand not found!", { cause: 404 }));

  // search filter sort paginate
  const results = await Product.find({ ...req.query })
    .sort(sort)
    .paginate(page)
    .search(keyword);

  return res.json({ success: true, results });
});
