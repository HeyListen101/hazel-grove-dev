"use server";
import { createClient } from "@/utils/supabase/server";

export const sendToRealtimeDB = async (formData: FormData) => {
    const content = formData.get("content")?.toString();
    // asign sentBy
};