import { Schema, Types, model } from "mongoose";

const tokenSchema = new Schema(
  {
    token: { type: String, required: true },
    user: { type: Types.ObjectId, ref: "User" },
    isValid: { type: Boolean, default: true },
    agent: { type: String },
    expiresAt: { type: String },
  },
  { timestamps: true }
);

export const Token = model("Token", tokenSchema);
