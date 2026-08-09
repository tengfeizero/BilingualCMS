import { NextResponse, type NextRequest } from "next/server";
import { listProducts, getPublishedProductBySlug } from "@/services/product.service";

/** 产品列表（公开） */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize") ?? 12)));
  const category = sp.get("category") ?? undefined;

  const { items, total } = listProducts({
    page,
    pageSize,
    categorySlug: category,
    status: "published",
  });

  return NextResponse.json({ items, total, page, pageSize });
}
