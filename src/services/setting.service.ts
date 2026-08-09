import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

export interface SiteSettings {
  site_name: string;
  site_description: string;
  site_logo: string;
  allow_register: string;
  [key: string]: string;
}

export function getSettings(): SiteSettings {
  const rows = db.select().from(settings).all();
  const result: Record<string, string> = {};
  for (const row of rows) {
    try {
      const value = JSON.parse(row.value);
      result[row.key] = typeof value === "string" ? value : JSON.stringify(value);
    } catch {
      result[row.key] = row.value;
    }
  }
  return result as SiteSettings;
}

export function getSetting(key: string): string {
  const row = db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .get();
  if (!row) return "";
  try {
    const value = JSON.parse(row.value);
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return row.value;
  }
}

export function setSetting(key: string, value: unknown) {
  db.insert(settings)
    .values({ key, value: JSON.stringify(value) })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: JSON.stringify(value) },
    })
    .run();
}
