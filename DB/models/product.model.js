import { Schema, Types, model } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true, min: 2, max: 20 },
    description: { type: String, min: 10, max: 200 },
    images: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    defaultImage: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    price: { type: Number, min: 1, required: true },
    discount: { type: Number, min: 1, max: 100 },
    availableItems: { type: Number, min: 1, required: true },
    soldItems: { type: Number, default: 0 },
    createdBy: { type: Types.ObjectId, ref: "User" },
    category: { type: Types.ObjectId, ref: "Category" },
    subcategory: { type: Types.ObjectId, ref: "Subcategory" },
    brand: { type: Types.ObjectId, ref: "Brand" },
    cloudFolder: { type: String, unique: true, required: true },
    averageRate: { type: Number, min: 1, max: 5 },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    strictQuery: true,
  }
);

productSchema.virtual("review", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
});

productSchema.virtual("finalPrice").get(function () {
  return Number.parseFloat(
    this.price - (this.price * this.discount || 0) / 100
  ).toFixed(2);
});

// query helper
productSchema.query.paginate = function (page) {
  // return query
  // this >>> query
  page = page < 1 || isNaN(page) || !page ? 1 : page;
  const limit = 1;
  const skip = limit * (page - 1);

  return this.skip(skip).limit(limit);
};

productSchema.query.search = function (keyword) {
  if (keyword) {
    return this.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });
  }

  return this;
};

productSchema.methods.inStock = function (requiredQuantity) {
  // this >>> document >> availableItems
  return this.availableItems >= requiredQuantity ? true : false;
};

export const Product = model("Product", productSchema);
