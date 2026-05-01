import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    
    // Daily: Start of today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Weekly: Start of this week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Monthly: Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Yearly: Start of this year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [daily, weekly, monthly, yearly] = await Promise.all([
      Sale.aggregate([
        { $match: { date: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { date: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { date: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ])
    ]);

    return NextResponse.json({
      daily: daily[0] || { total: 0, count: 0 },
      weekly: weekly[0] || { total: 0, count: 0 },
      monthly: monthly[0] || { total: 0, count: 0 },
      yearly: yearly[0] || { total: 0, count: 0 }
    });
  } catch (error) {
    console.error("Failed to fetch sales reports:", error);
    return NextResponse.json({ error: "Failed to fetch sales reports" }, { status: 500 });
  }
}
