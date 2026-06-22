// =====================================================================
// Backend client used across the whole app.
//
// • entities  → Supabase (the permanent, persistent database where all
//               profiles, listings, posts, etc. now live after migration).
// • functions → Cloudflare Worker backend functions.
// • auth      → Supabase auth (Google/email), normalized to the app's shape.
//
// `base44` keeps the same shape the app already calls (entities.*,
// functions.invoke, auth.*) so existing pages keep working unchanged.
// =====================================================================
import { cf } from "@/lib/cfClient";
import { supabaseEntities } from "@/lib/supabaseEntities";

// Core integrations (InvokeLLM, etc.) run on the backend. The frontend client
// only has entities/functions/auth, so we route Core.InvokeLLM through the
// `invokeLLM` backend function and return its parsed result — matching the
// real SDK contract (so callers like the AI Listing Assistant just work).
const integrations = {
  Core: {
    async InvokeLLM(payload = {}) {
      const res = await cf.functions.invoke("invokeLLM", payload);
      return res?.data?.result;
    },
  },
};

// Read & write entities straight to Supabase so saved data (profile covers,
// avatars, listings) persists across refreshes.
export const base44 = { ...cf, entities: supabaseEntities, integrations };
export default base44;