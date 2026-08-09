import { NextResponse } from "next/server";
import { getPublishedProductBySlug } from "@/services/product.service";

/** 产品详情（公开） */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = getPublishedProductBySlug(decodeURIComponent(slug));
  if (!product) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}
