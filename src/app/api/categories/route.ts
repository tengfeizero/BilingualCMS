import { NextResponse } from "next/server";
import { listCategories } from "@/services/category.service";

export const dynamic = "force-dynamic";

/** GET /api/categories */
export async function GET() {
  const categories = listCategories();
  return NextResponse.json({ items: categories });
}
