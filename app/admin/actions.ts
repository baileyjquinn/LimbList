"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/env";
import { deleteOrphanedMedia } from "@/lib/admin";

export type CleanupState = { removed?: number; error?: string };

export async function cleanupOrphans(): Promise<void> {
  // Re-check admin inside the action — never trust the page-level gate alone.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) return;

  await deleteOrphanedMedia();
  revalidatePath("/admin");
}
