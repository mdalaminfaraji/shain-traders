import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Sale from "@/models/Sale";
import Payment from "@/models/Payment";
import Customer from "@/models/Customer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: customerId } = await params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const sales = await Sale.find({ customerId }).sort({ date: 1 });
    const payments = await Payment.find({ customerId }).sort({ date: 1 });

    const ledger = [
      ...sales.map((s) => ({
        type: "Sale",
        date: s.date,
        amount: s.totalAmount,
        paid: s.paidAmount,
        due: s.balanceDue,
        details: s.items,
        _id: s._id,
      })),
      ...payments.map((p) => ({
        type: "Payment",
        date: p.date,
        amount: p.amount,
        method: p.method,
        reference: p.reference,
        _id: p._id,
      })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
;

    return NextResponse.json({ customer, ledger });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";

// export async function GET(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;

//     return NextResponse.json({ id });

//   } catch (error: any) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
