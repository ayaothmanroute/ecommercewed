import { Schema, Types, model } from "mongoose";

const orderSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: Types.ObjectId, ref: "Product" },
        quantity: { type: Number, min: 1 },
        name: String,
        itemPrice: Number,
        totalPrice: Number,
      },
    ],
    invoice: { url: String, id: String },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    price: { type: Number, required: true },
    coupon: {
      id: { type: Types.ObjectId, ref: "Coupon" },
      name: String,
      discount: { type: Number, min: 1, max: 100 },
    },
    payment: { type: String, enum: ["cash", "visa"], default: "cash" },
    status: {
      type: String,
      default: "placed",
      enum: ["placed", "shipped", "delivered", "canceled", "refunded"],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

orderSchema.virtual("finalPrice").get(function () {
  return this.coupon
    ? Number.parseFloat(
        this.price - (this.price * this.coupon.discount) / 100
      ).toFixed()
    : this.price;
});

export const Order = model("Order", orderSchema);
