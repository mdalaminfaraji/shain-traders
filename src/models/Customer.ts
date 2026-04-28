import mongoose, { Schema, model, models } from "mongoose";

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    creditLimit: { type: Number, default: 0 },
    balance: { type: Number, default: 0 }, // Positive means they owe us
  },
  { timestamps: true }
);

const Customer = models.Customer || model("Customer", CustomerSchema);
export default Customer;
