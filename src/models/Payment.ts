import mongoose, { Schema, model, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["Cash", "Cheque", "Transfer"], default: "Cash" },
    reference: { type: String }, // e.g., Cheque number
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

const Payment = models.Payment || model("Payment", PaymentSchema);
export default Payment;
