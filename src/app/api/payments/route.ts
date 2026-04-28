import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import Customer from "@/models/Customer";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { customerId, amount } = body;

    // 1. Create Payment record
    const payment = await Payment.create(body);

    // 2. Update Customer balance (decrease because they paid)
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { balance: -amount } }
    );

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error("Payment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const payments = await Payment.find({}).populate("customerId").sort({ date: -1 });
    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
