import React from "react";

const ANIM_CLASSES = {
  bounce: "animate-bounce",
  pulse: "animate-pulse",
  spin: "animate-spin",
  sway: "animate-pulse",
  float: "animate-pulse",
  roar: "animate-pulse",
  howl: "animate-pulse",
};

const EMOJI_MAP = {
  "dog-wag": { emoji: "🐕", anim: "bounce" },
  "cat-blink": { emoji: "😸", anim: "pulse" },
  "fox": { emoji: "🦊", anim: "sway" },
  "wolf": { emoji: "🐺", anim: "howl" },
  "lion": { emoji: "🦁", anim: "roar" },
  "tiger": { emoji: "🐯", anim: "bounce" },
  "panda": { emoji: "🐼", anim: "pulse" },
  "monkey": { emoji: "🐵", anim: "sway" },
  "baller1": { emoji: "🏀", anim: "spin" },
  "baller2": { emoji: "⛹️", anim: "bounce" },
  "bball-fire": { emoji: "🔥", anim: "pulse" },
  "robot": { emoji: "🤖", anim: "sway" },
  "alien": { emoji: "👽", anim: "pulse" },
  "ghost": { emoji: "👻", anim: "float" },
  "ninja": { emoji: "🥷", anim: "bounce" },
  "wizard": { emoji: "🧙", anim: "spin" },
  "dragon": { emoji: "🐲", anim: "roar" },
  "unicorn": { emoji: "🦄", anim: "float" },
  "celeb1": { emoji: "🕶️", anim: "sway" },
  "celeb2": { emoji: "🎤", anim: "pulse" },
  "celeb3": { emoji: "🏆", anim: "bounce" },
  "messi": { emoji: "⚽", anim: "pulse" },
  "ronaldo": { emoji: "🦁", anim: "pulse" },
  "neymar": { emoji: "✨", anim: "pulse" },
  "mbappe": { emoji: "⚡", anim: "pulse" },
  "lebron": { emoji: "🏀", anim: "pulse" },
  "curry": { emoji: "🎯", anim: "pulse" },
  "mayweather": { emoji: "🥊", anim: "pulse" },
  "usain-bolt": { emoji: "⚡", anim: "pulse" },
};

/**
 * Renders a user avatar — supports emoji-based animated avatars (emoji:id:🐕)
 * and regular image URLs.
 */
export default function UserAvatar({ avatarUrl, username, size = 36, className = "" }) {
  const isEmoji = avatarUrl?.startsWith("emoji:");

  if (isEmoji) {
    const parts = avatarUrl.split(":");
    const id = parts[1];
    const fallbackEmoji = parts[2] || "🐕";
    const config = EMOJI_MAP[id] || { emoji: fallbackEmoji, anim: "pulse" };
    const animClass = ANIM_CLASSES[config.anim] || "animate-pulse";

    return (
      <div
        className={`flex items-center justify-center rounded-full bg-purple-900/40 border border-purple-700/40 flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}>
        <span className={`${animClass}`} style={{ fontSize: size * 0.6, display: "inline-block" }}>
          {config.emoji}
        </span>
      </div>
    );
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username || ""}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback initials
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gray-700 text-white font-black flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {username?.[0]?.toUpperCase() || "?"}
    </div>
  );
}