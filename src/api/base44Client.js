// =====================================================================
// Backend client — Cloudflare Worker only.
// The whole app imports `base44` from here. We now back it entirely with
// the Cloudflare Worker (auth + D1 database + functions + R2 storage).
// Supabase and the legacy Base44 SDK are no longer used.
//
// `base44` keeps the same shape the app already calls (entities.*,
// functions.invoke, auth.*) so existing pages keep working unchanged.
// =====================================================================
import { cf } from "@/lib/cfClient";

export const base44 = cf;
export default base44;