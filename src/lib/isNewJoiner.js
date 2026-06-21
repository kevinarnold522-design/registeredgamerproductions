// A user is a "new joiner" within their first 7 days on the platform.
// Activities (daily rewards / welcome) target new joiners only.
const NEW_JOINER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function isNewJoiner(profile) {
  if (!profile) return false;
  const joined = profile.joined_date || profile.created_date;
  if (!joined) return true; // brand new, no date yet
  const ts = new Date(joined).getTime();
  if (Number.isNaN(ts)) return true;
  return Date.now() - ts < NEW_JOINER_WINDOW_MS;
}