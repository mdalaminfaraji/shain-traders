import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true }, // e.g., BSRM, Anwar
    category: { type: String, required: true }, // e.g., Rod, Cement
    unit: { type: String, required: true }, // e.g., KG, Bag
    stock: { type: Number, default: 0 },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);
export default Product;
