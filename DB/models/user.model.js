import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      min: 3,
      max: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    isConfirmed: { type: Boolean, default: false },
    gender: { type: String, enum: ["male", "female"] },
    phone: { type: String },
    role: { type: String, enum: ["user", "admin", "seller"], default: "user" },
    forgetCode: String,
    profileImage: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dd7nbp5ee/image/upload/v1706470655/ecommerceSunday8Demo/defaults/users/profilePic_vekmxr.jpg",
      },
      id: {
        type: String,
        default: "ecommerceSunday8Demo/defaults/users/profilePic_vekmxr",
      },
    },
    coverImages: [{ url: { type: String }, id: { type: String } }],
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  // this >> document
  if (this.isModified("password")) {
    this.password = bcryptjs.hashSync(
      this.password,
      parseInt(process.env.SALT_ROUND)
    );
  }
});

export const User = model("User", userSchema);
