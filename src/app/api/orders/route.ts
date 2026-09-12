import { NextResponse } from "next/server";
import { orderSchema, createOrder } from "@/lib/orders";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  try {
    const result = await createOrder(parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[orders] create failed", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
