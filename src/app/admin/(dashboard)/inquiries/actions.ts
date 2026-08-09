"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PERMISSIONS } from "@/lib/permissions";
import { requirePermission } from "@/services/auth.service";
import { deleteInquiry, updateInquiryStatus } from "@/services/inquiry.service";

export async function setInquiryStatusAction(formData: FormData) {
  await requirePermission(PERMISSIONS.INQUIRY_MANAGE);
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (id && ["new", "processing", "done"].includes(status)) {
    updateInquiryStatus(id, status);
    revalidatePath("/admin/inquiries");
  }
  redirect("/admin/inquiries");
}

export async function deleteInquiryAction(formData: FormData) {
  await requirePermission(PERMISSIONS.INQUIRY_MANAGE);
  const id = Number(formData.get("id"));
  if (id) {
    deleteInquiry(id);
    revalidatePath("/admin/inquiries");
  }
  redirect("/admin/inquiries");
}
