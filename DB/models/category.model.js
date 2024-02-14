import { Schema, Types, model } from "mongoose";
import { Subcategory } from "./subcategory.model.js";

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, min: 5, max: 20 },
    slug: { type: String, required: true, unique: true },
    createdBy: { type: Types.ObjectId, ref: "User" },
    image: { id: { type: String }, url: { type: String } },
    brands: [{ type: Types.ObjectId, ref: "Brand" }],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// virtual populate
categorySchema.virtual("subcategory", {
  ref: "Subcategory",
  localField: "_id", // Category
  foreignField: "category", // Subcategory
});

// hook
categorySchema.post(
  "deleteOne",
  { document: true, query: false },
  async function () {
    // this >>> document
    // delete subcategories
    await Subcategory.deleteMany({ category: this._id });
  }
);

export const Category = model("Category", categorySchema);
