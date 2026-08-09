import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/services/search.service";

export const dynamic = "force-dynamic";

/** GET /api/search?q=keyword&page=1 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? "";
  const page = Number(sp.get("page") ?? 1);
  const result = searchPosts(q, page, 10);
  return NextResponse.json(result);
}
