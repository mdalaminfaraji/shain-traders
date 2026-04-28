import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { customerId, items, totalAmount, paidAmount, balanceDue, date } = body;

    // 1. Create Sale record
    const sale = await Sale.create(body);

    // 2. Update Product stocks
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // 3. Update Customer balance
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { balance: balanceDue } }
    );

    return NextResponse.json(sale, { status: 201 });
  } catch (error: any) {
    console.error("Sale Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const sales = await Sale.find({}).populate("customerId").populate("items.productId").sort({ date: -1 });
    return NextResponse.json(sales);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
