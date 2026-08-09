import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tags } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** GET /api/tags */
export async function GET() {
  const all = db.select().from(tags).orderBy(asc(tags.name)).all();
  return NextResponse.json({ items: all });
}
