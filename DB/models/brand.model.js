import { Schema, Types, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, min: 2, max: 12 },
    slug: { type: String, required: true, unique: true },
    image: {
      id: { type: String, required: true },
      url: { type: String, required: true },
    },
    createdBy: { type: Types.ObjectId, ref: "User" },
    // categories: []
    // subcategories: []
  },
  { timestamps: true }
);

export const Brand = model("Brand", brandSchema);
