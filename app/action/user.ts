import { supabase } from "@/util/supabase";

export async function getUser() {
    return (await supabase.auth.getClaims()).data?.claims?.user_metadata;
}