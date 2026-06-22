import React from "react";

const platforms = [
  {
    name: "YouTube",
    url: "https://youtube.com",
    bg: "#FF0000",
    logo: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    ),
  },
  {
    name: "Twitch",
    url: "https://twitch.tv",
    bg: "#9146FF",
    logo: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>
    ),
  },
  {
    name: "Steam",
    url: "https://store.steampowered.com/search/?specials=1",
    bg: "#1b2838",
    logo: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.497 1.009 2.455-.397.957-1.494 1.403-2.455 1.012zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/></svg>
    ),
  },
  {
    name: "Epic Games",
    url: "https://store.epicgames.com/en-US/free-games",
    bg: "#2a2a2a",
    logo: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M2 2v20h8.5v-4.5H6.5v-11h4V10H14V2H2zm8.5 9h-4V7.5h4V11zm3.5 0V7.5H18V11h-4zm0 9.5H14v-9h4v9h-3.5zM18 2v5.5h-4V2h4zm2 0v20h2V2h-2z"/></svg>
    ),
  },
  {
    name: "PlayStation",
    url: "https://store.playstation.com",
    bg: "#003087",
    logo: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M8.984 2.596v14.347l3.17.984V6.158c0-.677.303-1.13.786-.984.636.207.76 1.004.76 1.681V12.9c2.121.979 3.7-.16 3.7-2.659 0-2.597-1.144-3.87-3.7-4.738-1.499-.508-3.22-.802-4.716-2.907zm-2 15.972l5.17 1.607v-3.178l-5.17-1.597v3.168zm12.3-3.9c-1.27-.476-2.587-.655-3.748-.474v2.98c.928-.195 1.887-.143 2.764.206.8.326.782.877-.043 1.156-.826.278-2.026.113-2.72-.155v2.863c1.77.595 4.27.517 5.727-.84 1.453-1.353 1.32-3.37.02-3.736z"/></svg>
    ),
  },
  {
    name: "Xbox",
    url: "https://www.xbox.com/en-US/games/all-games",
    bg: "#107C10",
    logo: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M4.102 5.498C4.604 4.617 5.24 3.826 6 3.152 5.547 3.414 5.12 3.72 4.72 4.064c-.84.7-1.51 1.59-1.99 2.61.4-.46.85-.87 1.37-1.18zm15.796 0c.52.31.97.72 1.37 1.18-.48-1.02-1.15-1.91-1.99-2.61-.4-.344-.827-.65-1.28-.912.76.674 1.396 1.465 1.9 2.346zm-13.5-1.84C7.673 2.91 9.772 2.25 12 2.25c2.228 0 4.327.66 6.102 1.408C16.384 2.013 14.28 1.2 12 1.2s-4.384.813-6.102 2.458zM2.714 8.434c-.043.52-.065 1.05-.065 1.566 0 5.523 4.477 10 10 10s10-4.477 10-10c0-.516-.022-1.046-.065-1.566C21.847 5.636 17.26 3.35 12 3.35S2.153 5.636 2.714 8.434zm5.284 5.566c-1.26-.91-2.2-2.73-1.67-4.86.37-1.49 1.54-2.79 3.17-2.25-.09.01-.18.02-.27.04C7.65 7.384 7.048 8.58 7.3 9.8c.375 1.834 2.05 2.83 3.8 2.1.51-.22 1.04-.53 1.54-.88.504.35 1.034.66 1.544.88 1.75.73 3.425-.266 3.8-2.1.252-1.22-.35-2.416-1.928-2.87-.09-.02-.18-.03-.27-.04 1.63-.54 2.8.76 3.17 2.25.53 2.13-.41 3.95-1.67 4.86-1.91 1.38-3.87 1.4-5.29.09-.33-.31-.55-.62-.7-.99-.15.37-.37.68-.7.99-1.42 1.31-3.38 1.29-5.29-.09z"/></svg>
    ),
  },
  {
    name: "GOG",
    url: "https://www.gog.com/games?sort=bestselling&page=1",
    bg: "#7b2d8b",
    logo: <span className="text-white font-black text-[10px]">GOG</span>,
  },
  {
    name: "Humble",
    url: "https://www.humblebundle.com/store/promo/free-games",
    bg: "#cc2929",
    logo: <span className="text-white font-bold text-[10px]">HB</span>,
  },
];

export default function PlatformLinksBar() {
  return (
    <div className="w-full bg-gray-950 border-b border-gray-800/50 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1 min-w-max">
        <span className="text-gray-500 text-xs font-semibold mr-2 whitespace-nowrap">🎮 Game Stores:</span>
        {platforms.map(p => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-80 transition-all whitespace-nowrap"
            style={{ background: p.bg }}
          >
            {p.logo}
            {p.name}
          </a>
        ))}
        <span className="ml-3 text-yellow-400 text-xs font-bold whitespace-nowrap">🔥 Best Deals Available!</span>
      </div>
    </div>
  );
}