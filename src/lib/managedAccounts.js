import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";

function normalizeManagedAccountInput(input = {}) {
  const username = String(input.username || "").trim();
  if (!username) throw new Error("Username is required");

  const email = input.email && String(input.email).includes("@")
    ? String(input.email).trim().toLowerCase()
    : `${username.toLowerCase().replace(/\s+/g, "_")}@gamerproductions.com`;

  return {
    email,
    username,
    display_name: String(input.display_name || username).trim() || username,
    account_type: input.account_type || "regular",
    avatar_url: input.avatar_url || "",
  };
}

function ensureAdminUser(currentUser) {
  if (!isAdmin(currentUser?.email)) {
    throw new Error("Forbidden: Admin access required");
  }
}

function makeFriendlySupabaseError(error) {
  const message = String(error?.message || error || "Failed to manage account");
  if (/row-level security|permission denied|not allowed|violates row-level/i.test(message)) {
    return "Supabase blocked this write. Confirm the signed-in admin account has insert access to UserProfile.";
  }
  return message;
}

export async function listManagedAccounts({ includeAll = false } = {}) {
  const rows = includeAll
    ? await base44.entities.UserProfile.list("-created_date", 1000)
    : await base44.entities.UserProfile.filter({ is_managed_account: true }, "-created_date", 1000);
  return rows.map((row) => ({
    ...row,
    stats: row.stats || { listings: 0, posts: 0, following: 0 },
  }));
}

export async function createManagedAccountProfile(currentUser, input = {}) {
  ensureAdminUser(currentUser);
  const normalized = normalizeManagedAccountInput(input);

  const [existingEmail, existingUsername] = await Promise.all([
    base44.entities.UserProfile.filter({ user_email: normalized.email }, undefined, 1),
    base44.entities.UserProfile.filter({ username: normalized.username }, undefined, 1),
  ]);

  if (existingEmail.length > 0) throw new Error("Email already registered");
  if (existingUsername.length > 0) throw new Error("Username already taken");

  try {
    const profile = await base44.entities.UserProfile.create({
      user_email: normalized.email,
      username: normalized.username,
      display_name: normalized.display_name,
      account_type: normalized.account_type,
      avatar_url: normalized.avatar_url,
      is_managed_account: true,
      managed_by_admin: currentUser.email,
      joined_date: new Date().toISOString(),
    });
    return { profile, email: normalized.email };
  } catch (error) {
    throw new Error(makeFriendlySupabaseError(error));
  }
}

export function startManagedAccountSession({ currentUser, account, reload = false, redirectUrl = null }) {
  const impersonationData = {
    isImpersonating: true,
    isGhostLogin: true,
    isPersistent: true,
    originalUser: currentUser ? { email: currentUser.email, full_name: currentUser.full_name } : null,
    targetEmail: account.user_email,
    targetUsername: account.username,
    targetDisplayName: account.display_name || account.username,
    targetAvatar: account.avatar_url || "",
    targetAccountType: account.account_type || "regular",
    started_at: new Date().toISOString(),
  };
  localStorage.setItem("impersonation_session", JSON.stringify(impersonationData));

  if (redirectUrl) {
    window.location.href = redirectUrl;
    return;
  }

  if (reload) {
    window.location.reload();
  }
}

export function buildManagedAccountRedirect(email) {
  return `/profile?email=${encodeURIComponent(email)}&ghost_session=1`;
}