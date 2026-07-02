const HIDDEN_GENERAL_FEED_POST_IDS = new Set([
  "6a3150736f909e72cb79f16f",
  "6a2839dc00b72f2e9967a5f9",
  "6a19d8abfa200f77b8534d69",
  "6a19d879930c74950646457c",
]);

const HIDDEN_GENERAL_FEED_POST_CONTENTS = new Set([
  "Become a member now and start posting, earn 1$ per 1000 veiws, this is for die hard gta fans.",
  "GTA 5, the game that broke all financial records, is it the Goat of all games? Heart this if yes!",
  "Welome to the official Football Life page",
  "Welcome to the Official Channel for Mod posting and Graphics and Gameplay sharing for Football Life 2026.",
]);

export function shouldHideFromGeneralFeeds(post = {}) {
  const id = String(post?.id || "").trim();
  const content = String(post?.content || "").trim();
  return HIDDEN_GENERAL_FEED_POST_IDS.has(id) || HIDDEN_GENERAL_FEED_POST_CONTENTS.has(content);
}

