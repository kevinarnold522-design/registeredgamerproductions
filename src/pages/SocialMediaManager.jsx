import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Wand2, Share2, Facebook, RefreshCw, Check, ChevronDown, ChevronUp, Sparkles, ImageIcon } from "lucide-react";
import AuthNavbar from "@/components/layout/AuthNavbar";
import Navbar from "@/components/home/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import SocialCardCanvas from "@/components/social/SocialCardCanvas";

// ─── 100+ Themed Social Media Posts ────────────────────────────────────────
const ALL_POSTS = [
  // --- REFERRAL PROGRAM ---
  { id: 1, category: "Referral Program", platform: "Facebook", emoji: "🤝", text: "🎮 Got gamer friends? Refer them to GAMER.Productions and earn rewards! Every referral counts toward real cash prizes. Share your link now 👇 gamer.productions #GamerProductions #ReferAndEarn" },
  { id: 2, category: "Referral Program", platform: "Facebook", emoji: "💸", text: "💸 Earn while you sleep! Share GAMER.Productions with your squad and watch your rewards stack up. The more you refer, the more you earn! Join the biggest gaming community now 🎮 #GamingCommunity #ReferralRewards" },
  { id: 3, category: "Referral Program", platform: "Facebook Group", emoji: "📣", text: "📣 HEY GAMERS! Did you know GAMER.Productions has a referral program? Invite your friends, level up together, and BOTH of you get rewarded! 🏆 Drop your referral link in the comments below! #GamerNation #ReferAndWin" },
  { id: 4, category: "Referral Program", platform: "Facebook", emoji: "🏆", text: "🏆 Top referrers on GAMER.Productions get EXCLUSIVE rewards! Are you sharing enough? Help grow our gaming family and get recognized! Visit gamer.productions today 🎮 #TopGamer #ReferralKing" },
  { id: 5, category: "Referral Program", platform: "Facebook Group", emoji: "🎁", text: "🎁 FREE REWARDS just for inviting friends! GAMER.Productions gives you real incentives for every gamer you bring in. Free mods, premium access & more await! 🔥 #FreeRewards #GamingFamily" },

  // --- GET MONETISED $1 ---
  { id: 6, category: "Get Monetised $1", platform: "Facebook", emoji: "💰", text: "💰 START EARNING FROM GAMING for just $1/year! GAMER.Productions Tier 1 membership gives you verified status, the ability to post & sell, and earn real money from your passion. 🎮 Sign up today! gamer.productions #GetPaid #GamerLife" },
  { id: 7, category: "Get Monetised $1", platform: "Facebook Group", emoji: "🚀", text: "🚀 GAMERS — Turn your hobby into income! For only $1 a year, become a Tier 1 Verified Partner on GAMER.Productions. Post mods, sell content, and build your brand! 💪 Who else is ready to earn? #GamingIncome #Tier1" },
  { id: 8, category: "Get Monetised $1", platform: "Facebook", emoji: "🎮", text: "🎮 Did you know you can get MONETISED as a gamer for just $1? GAMER.Productions Verified Partner unlocks ad-free browsing, community posting rights & revenue sharing. Only $1/year! ✅ gamer.productions" },
  { id: 9, category: "Get Monetised $1", platform: "Facebook Group", emoji: "💎", text: "💎 THE CHEAPEST WAY TO MONETISE YOUR GAMING CONTENT — $1/year on GAMER.Productions! Join thousands of creators already earning from mods, tutorials, clips & streams. Are you in? 🔥 #ContentCreator #GamingMoney" },
  { id: 10, category: "Get Monetised $1", platform: "Facebook", emoji: "✅", text: "✅ $1. One year. Unlimited earning potential. GAMER.Productions Tier 1 is the best deal in gaming. Get verified, get paid, get noticed! 🏆 Link in bio — gamer.productions #MonetiseYourPassion" },
  { id: 11, category: "Get Monetised $1", platform: "Facebook Group", emoji: "📈", text: "📈 Your gaming skills are worth money! GAMER.Productions pays creators for their content. Tier 1 membership is just $1/year to unlock selling, posting & income features. Don't sleep on this! 💤➡️💰 #GamingEconomy" },

  // --- START STREAMING & MAKING MONEY ---
  { id: 12, category: "Start Streaming", platform: "Facebook", emoji: "🎥", text: "🎥 READY TO GO LIVE AND GET PAID? Start your streaming journey on GAMER.Productions! Connect your YouTube, go live, build your audience & earn from every stream. 🔴 Start today — gamer.productions #StartStreaming #GameStreamer" },
  { id: 13, category: "Start Streaming", platform: "Facebook Group", emoji: "📡", text: "📡 ATTENTION ALL STREAMERS & ASPIRING STREAMERS! GAMER.Productions is your new home. Go live, post replays, grow your channel, and MAKE MONEY doing what you love! 🎮💰 Drop your stream link below! 👇 #StreamingLife" },
  { id: 14, category: "Start Streaming", platform: "Facebook", emoji: "🔴", text: "🔴 You don't need a huge channel to start earning! GAMER.Productions supports small streamers with tools to grow, monetise, and reach thousands of gamers worldwide. Start your stream today! 🌍 #SmallStreamer #GrowYourChannel" },
  { id: 15, category: "Start Streaming", platform: "Facebook Group", emoji: "💡", text: "💡 PRO TIP: Upload your stream highlights to GAMER.Productions and earn from past content too! Not just live — your VODs and clips generate income 24/7! 🤑 Who's streaming this weekend? #StreamerLife #PassiveIncome" },
  { id: 16, category: "Start Streaming", platform: "Facebook", emoji: "🏆", text: "🏆 From zero to hero — GAMER.Productions has built-in tools for new streamers. AI Video Studio, content creator dashboard, analytics & monetisation all in ONE place! 🎮 #AIStreaming #GameStreamer" },
  { id: 17, category: "Start Streaming", platform: "Facebook Group", emoji: "🌟", text: "🌟 Your stream deserves an audience! Share it on GAMER.Productions and reach a community of passionate gamers who actually WANT to watch your content. Go LIVE today! 🔴 #LiveStreaming #GamingContent" },

  // --- JOIN GAMING COMMUNITIES ---
  { id: 18, category: "Gaming Communities", platform: "Facebook", emoji: "🎮", text: "🎮 JOIN YOUR FAVOURITE GAMING COMMUNITY on GAMER.Productions! GTA, PES, FIFA, WWE2K, NBA2K, MLBB & 100+ more! Connect, share, discuss & post with fellow fans! 🌍 gamer.productions/gaming-community #GamingCommunity" },
  { id: 19, category: "Gaming Communities", platform: "Facebook Group", emoji: "👥", text: "👥 Calling all GTA fans, FIFA modders, NBA2K creators & PES legends! Your community HUB is live on GAMER.Productions! 🔥 Join, post, share mods & connect with gamers worldwide! Which game is your home? 👇 #GTACommunity #FIFAMods" },
  { id: 20, category: "Gaming Communities", platform: "Facebook", emoji: "🏟️", text: "🏟️ 100+ GAMING FRANCHISE COMMUNITIES in one place! WWE2K, Football Life, PPSSPP, GTA, MLBB, DOTA, Valorant & more — all on GAMER.Productions! Find your tribe! 🎮 #GamingTribe #GamerCommunity" },
  { id: 21, category: "Gaming Communities", platform: "Facebook Group", emoji: "🛡️", text: "🛡️ Want to be a Community Captain on GAMER.Productions? Apply as a group moderator and lead YOUR gaming community! Exclusive tools, badge & recognition await! 🏆 Apply at gamer.productions #CommunityLeader #GamingModerator" },
  { id: 22, category: "Gaming Communities", platform: "Facebook", emoji: "📣", text: "📣 PES community is LIVE on GAMER.Productions! Share option files, kits, patches & connect with PES/eFootball fans worldwide! Join now! ⚽ gamer.productions/gaming-community #PESCommunity #eFootball" },
  { id: 23, category: "Gaming Communities", platform: "Facebook Group", emoji: "🤼", text: "🤼 WWE2K fans UNITE! The biggest WWE2K mod community is on GAMER.Productions! Attires, arenas, rosters — share them all & connect with 1000s of fans! 💪 #WWE2K #WrestlingGames #ModCommunity" },
  { id: 24, category: "Gaming Communities", platform: "Facebook", emoji: "🏀", text: "🏀 NBA2K community is poppin on GAMER.Productions! Share cyberfaces, courts, jerseys & gameplay clips with the best NBA2K community online! Join now! 🔥 #NBA2K #BasketballGaming" },

  // --- MODS & MODDING ---
  { id: 25, category: "Mods & Modding", platform: "Facebook", emoji: "🔧", text: "🔧 MODDERS — Your work deserves a global audience! Upload your GTA, PES, FIFA, WWE2K, NBA2K mods on GAMER.Productions and get downloads, reviews & income! 🚀 #GamingMods #ModCreator" },
  { id: 26, category: "Mods & Modding", platform: "Facebook Group", emoji: "🌴", text: "🌴 FREE GTA SA MODS available NOW on GAMER.Productions! Texture packs, scripts, cheats & full overhaul mods — all in one place! Download for free today! 🎮 #GTASanAndreas #GTAMods" },
  { id: 27, category: "Mods & Modding", platform: "Facebook", emoji: "🏙️", text: "🏙️ GTA 5 modders — share your creations on GAMER.Productions and build your fanbase! Script mods, visual overhauls, car packs & more! The biggest GTA mod hub is HERE! 💻 #GTA5Mods #Modding" },
  { id: 28, category: "Mods & Modding", platform: "Facebook Group", emoji: "🎮", text: "🎮 PPSSPP/PSP players! Find the best ISO mods, texture packs & cheat codes on GAMER.Productions! Relive your favourite classic games in HD! 📱 #PPSSPPMods #PSPGames #RetroGaming" },
  { id: 29, category: "Mods & Modding", platform: "Facebook", emoji: "📱", text: "📱 Android gamers — GAMER.Productions has the best collection of APK mods, patched games & mobile tools! All free to download from verified creators! 🔥 #AndroidMods #MobileGaming #APKMods" },
  { id: 30, category: "Mods & Modding", platform: "Facebook Group", emoji: "⚽", text: "⚽ FOOTBALL LIFE modders! Share your kits, stadium packs, balls & gameplay patches on GAMER.Productions! The best Football Life community is waiting for you! 🏟️ #FootballLife #SoccerMods" },

  // --- MARKETPLACE / BUY & SELL ---
  { id: 31, category: "Marketplace", platform: "Facebook", emoji: "🛒", text: "🛒 BUY & SELL gaming items on GAMER.Productions! Game accounts, in-game items, skins, gift cards, premium mods & more — all in a safe, trusted marketplace! 💰 gamer.productions #GamingMarketplace #SellGames" },
  { id: 32, category: "Marketplace", platform: "Facebook Group", emoji: "💎", text: "💎 RARE GAMING ITEMS for sale on GAMER.Productions! Ranked accounts, exclusive skins, gift cards & premium mod packs! Safe transactions guaranteed! 🔐 Check it out! #GamingItems #RareSkins" },
  { id: 33, category: "Marketplace", platform: "Facebook", emoji: "🎁", text: "🎁 Looking for cheap Steam, PSN or Xbox gift cards? GAMER.Productions marketplace has the BEST deals from trusted sellers! Save money on your next gaming purchase! 💸 #GiftCards #SteamDeals #GamingDeals" },
  { id: 34, category: "Marketplace", platform: "Facebook Group", emoji: "🏆", text: "🏆 SELL YOUR GAMING SKILLS on GAMER.Productions! Offer coaching, boosting, design services or custom builds to thousands of gamers in our marketplace! 💪 Start earning now! #GamingServices #EsportsCoach" },

  // --- DAILY REWARDS ---
  { id: 35, category: "Daily Rewards", platform: "Facebook", emoji: "🔥", text: "🔥 LOG IN EVERY DAY on GAMER.Productions and earn REAL rewards! Daily check-in streaks unlock exclusive badges, points & up to $10 USD cash prize for 365-day streaks! 💰 Are you on your streak? #DailyRewards #GamingRewards" },
  { id: 36, category: "Daily Rewards", platform: "Facebook Group", emoji: "📅", text: "📅 DAY STREAK CHALLENGE! How many consecutive days have you logged into GAMER.Productions? Share your streak below! 365 days = $10 CASH PRIZE! 🏆 Let's go! #StreakChallenge #GamerRewards" },
  { id: 37, category: "Daily Rewards", platform: "Facebook", emoji: "💰", text: "💰 $10 USD just for logging in daily?! YES! GAMER.Productions rewards loyal gamers with REAL cash for 365-day login streaks! Start your streak TODAY! 🎮 gamer.productions #EarnFromGaming #DailyLogin" },

  // --- GAMING GEAR / BUY & SELL PHYSICAL ---
  { id: 38, category: "Gaming Gear", platform: "Facebook", emoji: "🖥️", text: "🖥️ Looking for gaming gear deals? GAMER.Productions has keyboards, mice, monitors, headsets, controllers & gaming PCs from trusted sellers! Find your perfect setup! 🎮 #GamingGear #GamingSetup" },
  { id: 39, category: "Gaming Gear", platform: "Facebook Group", emoji: "🎧", text: "🎧 SELLING YOUR OLD GAMING GEAR? List it on GAMER.Productions and reach thousands of buyers! Consoles, controllers, accessories & more — fast & safe transactions! 💰 #SellGamingGear #GamingAccessories" },

  // --- TOURNAMENTS ---
  { id: 40, category: "Tournaments", platform: "Facebook", emoji: "🏆", text: "🏆 TOURNAMENTS ARE LIVE on GAMER.Productions! FPS, Battle Royale, MOBA, Sports & Fighting game cups happening NOW! Register and prove you're the best! 🎮 gamer.productions #GamingTournament #EsportsNow" },
  { id: 41, category: "Tournaments", platform: "Facebook Group", emoji: "🎯", text: "🎯 CALLING ALL COMPETITIVE GAMERS! Host your own tournament on GAMER.Productions! Reach hundreds of registered players in your game community! Set your rules, prizes & play! 🕹️ #HostTournament #EsportsPH" },
  { id: 42, category: "Tournaments", platform: "Facebook", emoji: "🪂", text: "🪂 PUBG, Fortnite & Free Fire Battle Royale tournaments — register NOW on GAMER.Productions! Prizes, glory & bragging rights await! 🏆 Who's ready to drop in? #BattleRoyale #TournamentGaming" },

  // --- AI VIDEO STUDIO ---
  { id: 43, category: "AI Video Studio", platform: "Facebook", emoji: "🎬", text: "🎬 EDIT YOUR GAMING VIDEOS WITH AI! GAMER.Productions has a built-in AI Video Studio — trim, caption, score & export your clips without any software! 🤖 Try it FREE! gamer.productions/ai-video-studio #AIVideoStudio #GamingContent" },
  { id: 44, category: "AI Video Studio", platform: "Facebook Group", emoji: "🤖", text: "🤖 No editing skills? No problem! GAMER.Productions AI Video Studio does the heavy lifting for you! Create pro-level gaming content in minutes! 🎥 Who needs this? Tag a creator! #AIContent #GamingVideos" },
  { id: 45, category: "AI Video Studio", platform: "Facebook", emoji: "✂️", text: "✂️ Your best gaming clips deserve cinematic editing! GAMER.Productions AI Video Studio has templates, music, captions & AI enhancement tools — all FREE to use! 🎮 #GamingClips #VideoEditing" },

  // --- GENERAL HYPE / PLATFORM ---
  { id: 46, category: "Platform Hype", platform: "Facebook", emoji: "🌍", text: "🌍 GAMER.Productions is the #1 Gaming Hub Community! Mods, marketplace, live streams, communities, tournaments, daily rewards & more — ALL IN ONE PLACE! 🎮 Join 10,000+ gamers today! gamer.productions" },
  { id: 47, category: "Platform Hype", platform: "Facebook Group", emoji: "🔥", text: "🔥 If you're a gamer, you NEED to be on GAMER.Productions! It's built FOR gamers BY a gamer. Stream, sell, share, connect & EARN — all in one platform! 💯 Drop your username below! 👇" },
  { id: 48, category: "Platform Hype", platform: "Facebook", emoji: "🏅", text: "🏅 Proud to announce GAMER.Productions has helped gamers worldwide earn, connect & grow! Join the fastest growing gaming platform — it's FREE to join! 🎮 gamer.productions #GamingPlatform #JoinNow" },
  { id: 49, category: "Platform Hype", platform: "Facebook Group", emoji: "💪", text: "💪 GAMING IS MORE THAN JUST A HOBBY — it's a CAREER on GAMER.Productions! Thousands of gamers are already earning from their passion. When are you joining? 🎮 #GamingCareer #GamersUnite" },
  { id: 50, category: "Platform Hype", platform: "Facebook", emoji: "⭐", text: "⭐ 5 STAR GAMING PLATFORM! GAMER.Productions has everything a gamer needs — free content, paid mods, community groups, streaming tools & real cash rewards! ⭐ Visit us at gamer.productions" },

  // --- CONTENT CREATORS ---
  { id: 51, category: "Content Creators", platform: "Facebook", emoji: "🎥", text: "🎥 CONTENT CREATORS — share your gaming videos, tutorials, highlights & clips on GAMER.Productions! Reach a dedicated gaming audience that LOVES your content! 🎮 Upload now! #ContentCreator #GamingYouTuber" },
  { id: 52, category: "Content Creators", platform: "Facebook Group", emoji: "📺", text: "📺 Post your gaming videos on GAMER.Productions and get REAL engagement from gamers who care! Unlike other platforms, our audience is 100% gaming-focused! 🎯 Share your latest video below! #GamingContent #GamingYouTube" },
  { id: 53, category: "Content Creators", platform: "Facebook", emoji: "🏆", text: "🏆 Top creators on GAMER.Productions get featured on the homepage! Upload consistently, grow your following & get the recognition you deserve! 🎮 Start uploading! #FeaturedCreator #GamingChannel" },

  // --- VERIFIED BADGE ---
  { id: 54, category: "Verified Badge", platform: "Facebook", emoji: "✅", text: "✅ Get VERIFIED on GAMER.Productions! Our Gaming Checkmark badge shows the world you're a trusted, committed member of the gaming community! Apply for verification at gamer.productions #VerifiedGamer #GamingCheckmark" },
  { id: 55, category: "Verified Badge", platform: "Facebook Group", emoji: "🏅", text: "🏅 VERIFIED PARTNER BADGE — only $1/year and it changes EVERYTHING! More visibility, posting rights, seller access & community trust! Get yours on GAMER.Productions 🔥 #VerifiedPartner #GamingBadge" },

  // --- SOCIAL MEDIA GROWTH ---
  { id: 56, category: "Social Growth", platform: "Facebook", emoji: "📘", text: "📘 Follow GAMER.Productions on Facebook for daily gaming news, mod drops, giveaways & community highlights! Hit that FOLLOW button NOW! 🎮 facebook.com/share/1D9ey9w8Rw #GamingFacebook #GamerProductions" },
  { id: 57, category: "Social Growth", platform: "Facebook Group", emoji: "▶️", text: "▶️ Subscribe to GAMER.Productions on YouTube! Tutorials, mod reviews, gaming news & community highlights every week! 🎮 youtube.com/@registeredgamerproductions #GamingYouTube #Subscribe" },
  { id: 58, category: "Social Growth", platform: "Facebook", emoji: "🔔", text: "🔔 Turn on notifications for GAMER.Productions! Never miss a mod drop, tournament announcement, giveaway or community update! 🎮 Follow us everywhere! #GamingNotifications #GamerLife" },

  // --- MOTIVATIONAL / COMMUNITY ---
  { id: 59, category: "Community Motivation", platform: "Facebook Group", emoji: "💬", text: "💬 What game are you playing this weekend? Drop it below and find other gamers to play with on GAMER.Productions! 🎮 Our gaming communities connect you with players worldwide! #GamingWeekend #FindGamers" },
  { id: 60, category: "Community Motivation", platform: "Facebook", emoji: "🎮", text: "🎮 Tag a gamer friend who needs to join GAMER.Productions! Let's build the biggest gaming community in Southeast Asia together! 🌏 #TagAGamer #GamingCommunity #GamerFamily" },
  { id: 61, category: "Community Motivation", platform: "Facebook Group", emoji: "🤜", text: "🤜 GAMERS UNITE! GAMER.Productions is building the most passionate gaming community online. Whether you mod, stream, compete or just game for fun — YOU belong here! 🎮 Join us! #GamersUnite #GamingFamily" },
  { id: 62, category: "Community Motivation", platform: "Facebook", emoji: "🌟", text: "🌟 Every great gaming community starts with passionate players like YOU! Join GAMER.Productions and help us build something legendary! 🏆 We're just getting started! #BuildingLegacy #GamingCommunity" },

  // --- SPECIFIC GAME HYPE ---
  { id: 63, category: "Game Specific", platform: "Facebook Group", emoji: "⚽", text: "⚽ PES / eFootball players! The BEST option files, kits, gameplay patches & squad updates are on GAMER.Productions! Check the PES community now! 🏟️ #PES2025 #eFootball #OptionFile" },
  { id: 64, category: "Game Specific", platform: "Facebook Group", emoji: "🏙️", text: "🏙️ GTA fans! The most complete collection of GTA 4, GTA 5 & GTA San Andreas mods is on GAMER.Productions! Cars, maps, scripts, textures & more! 🚗 #GTAMods #GrandTheftAuto #GTA5" },
  { id: 65, category: "Game Specific", platform: "Facebook Group", emoji: "🤼", text: "🤼 WWE2K community — GAMER.Productions has the best roster mods, attires, arenas & entrance themes! Download FREE and PREMIUM packs today! 💪 #WWE2K25 #WrestlingGames #WWEMods" },
  { id: 66, category: "Game Specific", platform: "Facebook Group", emoji: "🏀", text: "🏀 NBA2K players! Find the highest quality cyberfaces, courts, jerseys, shoes & gameplay sliders on GAMER.Productions! Elevate your game! 🔥 #NBA2K25 #BasketballGaming #NBA2KMods" },
  { id: 67, category: "Game Specific", platform: "Facebook Group", emoji: "🎮", text: "🎮 PPSSPP/PSP gamers rejoice! Hundreds of enhanced ISO files, HD texture packs & cheat codes available FREE on GAMER.Productions! Relive the classics! 🕹️ #PPSSPP #PSPGames #RetroGaming" },
  { id: 68, category: "Game Specific", platform: "Facebook Group", emoji: "📱", text: "📱 Mobile Legends & MLBB players! Join the GAMER.Productions MLBB community — share highlights, join tournaments, find teammates & more! 🏆 #MobileLegends #MLBB #MobileGaming" },

  // --- GIVEAWAYS ---
  { id: 69, category: "Giveaways", platform: "Facebook", emoji: "🎁", text: "🎁 GIVEAWAY ALERT! GAMER.Productions is giving away FREE premium mod packs, gift cards & gaming rewards to our loyal community! To enter: 1) Follow our page 2) Tag 2 friends 3) Share this post! 🔥 #Giveaway #GamingGiveaway" },
  { id: 70, category: "Giveaways", platform: "Facebook Group", emoji: "🎉", text: "🎉 Community Celebration! We just hit a new milestone and we're giving BACK to the community! Join GAMER.Productions to be part of our upcoming giveaway events! 🎮 Stay tuned! #CommunityGiveaway #GamerProductions" },

  // --- ESPORTS / JOBS ---
  { id: 71, category: "Jobs & Esports", platform: "Facebook", emoji: "💼", text: "💼 Gaming Jobs are REAL JOBS! Find QA testing, game dev, coaching, community management & content creator opportunities on GAMER.Productions! 🎮 Your dream gaming career awaits! #GamingJobs #EsportsCareers" },
  { id: 72, category: "Jobs & Esports", platform: "Facebook Group", emoji: "🏆", text: "🏆 BECOME AN ESPORTS COACH on GAMER.Productions! If you're a top player in your game, offer coaching sessions and earn real money! 🎮 Post your coaching offer in our marketplace! #EsportsCoach #GamingCoach" },
  { id: 73, category: "Jobs & Esports", platform: "Facebook", emoji: "🎨", text: "🎨 Graphic designers needed! Gaming brands are looking for overlay designers, logo creators & banner artists on GAMER.Productions! List your services and get paid! 💰 #GamingDesign #GraphicDesigner" },

  // --- PC BUILDS / SERVICES ---
  { id: 74, category: "Services", platform: "Facebook Group", emoji: "🖥️", text: "🖥️ Need a custom gaming PC build? GAMER.Productions has trusted builders offering full custom rigs tailored to your budget & gaming needs! 🔧 Browse services at gamer.productions #CustomPCBuild #GamingPC" },
  { id: 75, category: "Services", platform: "Facebook", emoji: "⚡", text: "⚡ RANK BOOSTING SERVICES available on GAMER.Productions! Get boosted in MLBB, Valorant, CODM & more by verified, experienced players! Fast, safe & affordable! 🏆 #RankBoost #GamingService" },

  // --- MUSIC LIBRARY ---
  { id: 76, category: "Music Library", platform: "Facebook", emoji: "🎵", text: "🎵 FREE GAMING MUSIC for your streams and videos! GAMER.Productions Music Library has royalty-free tracks for your content — no copyright strikes! 🎮 Browse at gamer.productions/music-library #RoyaltyFreeMusic #GamingMusic" },
  { id: 77, category: "Music Library", platform: "Facebook Group", emoji: "🎧", text: "🎧 Streamers — stop worrying about DMCA strikes! GAMER.Productions Music Library has free gaming background tracks ready for your live streams & videos! 🎮 #StreamerMusic #NoCopyright" },

  // --- ENGAGEMENT POSTS ---
  { id: 78, category: "Engagement", platform: "Facebook Group", emoji: "🗳️", text: "🗳️ POLL TIME! Which game do you want to see a dedicated tournament for on GAMER.Productions? 👇 A) PES/eFootball B) WWE2K C) NBA2K D) MLBB Vote below! 🏆 #GamingPoll #TournamentVote" },
  { id: 79, category: "Engagement", platform: "Facebook Group", emoji: "🏅", text: "🏅 FLEX YOUR SETUP! Share a photo of your gaming setup in the comments and get featured on GAMER.Productions! 🎮 We showcase the best setups every week! #GamingSetup #SetupWarsTH" },
  { id: 80, category: "Engagement", platform: "Facebook", emoji: "❓", text: "❓ If you could only play ONE game for the rest of your life, what would it be? Drop your answer below! 🎮 The most popular answer gets featured on GAMER.Productions this week! #GamingQuestion #FavoriteGame" },
  { id: 81, category: "Engagement", platform: "Facebook Group", emoji: "💬", text: "💬 SHOUTOUT THREAD! Drop your GAMER.Productions username below and let's connect! Follow each other, join the same communities & level up together! 🎮 #GamerShoutout #GamingNetwork" },
  { id: 82, category: "Engagement", platform: "Facebook", emoji: "🔁", text: "🔁 SHARE this post if you're a serious gamer! Let's find out how many real gamers are in our network! The more you share, the stronger our community grows! 🌍 #GamerNation #ShareIfGamer" },

  // --- SEASONAL / SPECIAL ---
  { id: 83, category: "Special Events", platform: "Facebook", emoji: "🎉", text: "🎉 WEEKEND GAMING MARATHON happening in GAMER.Productions communities! Join your favourite game group, post your sessions & interact with fellow gamers all weekend! 🎮 Let's game! #WeekendGaming #GamingMarathon" },
  { id: 84, category: "Special Events", platform: "Facebook Group", emoji: "🌙", text: "🌙 Late night gaming session? So is the GAMER.Productions community! Join us, share your gameplay & find late-night gaming partners! 🎮🌃 #LateNightGaming #GamerLife" },
  { id: 85, category: "Special Events", platform: "Facebook", emoji: "🏖️", text: "🏖️ Holiday gaming sale on GAMER.Productions! Sellers are dropping prices on mods, accounts, gift cards & more! Grab your deals now! 🎮 gamer.productions #HolidaySale #GamingDeals" },

  // --- INSPIRATIONAL ---
  { id: 86, category: "Inspirational", platform: "Facebook", emoji: "💡", text: "💡 'Gaming taught me persistence, strategy & teamwork.' — Sound familiar? Gaming is more than entertainment — it's life skills. Share your gaming journey with GAMER.Productions! 🎮 #GamingLife #GamerMindset" },
  { id: 87, category: "Inspirational", platform: "Facebook Group", emoji: "🌟", text: "🌟 From casual gamer to content creator — your journey starts at GAMER.Productions! We support gamers at EVERY level, from hobbyist to professional. Share YOUR story! 🎮 #GamingJourney #GamerGrowth" },
  { id: 88, category: "Inspirational", platform: "Facebook", emoji: "🏆", text: "🏆 Every gaming champion started as a beginner. GAMER.Productions is here to support your journey — from first game to first paycheck! 🎮 Join our community today! #GamingJourney #LevelUp" },

  // --- PLATFORM FEATURES ---
  { id: 89, category: "Platform Features", platform: "Facebook", emoji: "📊", text: "📊 GAMER.Productions has BUILT-IN analytics for creators! Track your views, followers, sales & earnings all from one dashboard! 📈 Know your numbers, grow your brand! gamer.productions #GamingAnalytics #CreatorTools" },
  { id: 90, category: "Platform Features", platform: "Facebook Group", emoji: "🔔", text: "🔔 Instant notifications, DM messaging, community posts & real-time updates — GAMER.Productions keeps you connected with the gaming world 24/7! 🎮 Download the app or visit gamer.productions! #GamingApp #StayConnected" },
  { id: 91, category: "Platform Features", platform: "Facebook", emoji: "🛡️", text: "🛡️ Safe, secure & trusted! GAMER.Productions uses verified seller badges, payment protection & content moderation to keep our community clean & safe! 🎮 Shop and connect with confidence! #SafeGaming #TrustedPlatform" },
  { id: 92, category: "Platform Features", platform: "Facebook Group", emoji: "🌐", text: "🌐 GAMER.Productions supports multiple languages & serves gamers from Philippines, Indonesia, Malaysia, Thailand, India, Africa & worldwide! 🌍 A truly GLOBAL gaming platform! #GlobalGaming #InternationalGamingCommunity" },

  // --- CALL TO ACTION ---
  { id: 93, category: "Call to Action", platform: "Facebook", emoji: "👇", text: "👇 If you haven't joined GAMER.Productions yet, what are you waiting for?! 🎮 FREE to join, free to browse, free to download mods! Create your account in 30 seconds! gamer.productions #JoinNow #FreeGaming" },
  { id: 94, category: "Call to Action", platform: "Facebook Group", emoji: "📲", text: "📲 BOOKMARK THIS: gamer.productions — The ONLY gaming platform you'll ever need! Mods, streams, marketplace, communities, tournaments & more. Save this for later! 🎮 #GamingBookmark #MustVisit" },
  { id: 95, category: "Call to Action", platform: "Facebook", emoji: "💌", text: "💌 Share GAMER.Productions with 3 gaming friends today and help our community grow! The bigger we get, the more rewards, events & content we can bring you! 🎮 #ShareGaming #GrowTogether" },
  { id: 96, category: "Call to Action", platform: "Facebook Group", emoji: "🚀", text: "🚀 LAUNCH YOUR GAMING CAREER today on GAMER.Productions! Whether you mod, stream, coach, design or compete — there's a place for YOU here! 🎮 Register at gamer.productions #GamingCareer #LaunchYourself" },
  { id: 97, category: "Call to Action", platform: "Facebook", emoji: "🎮", text: "🎮 ONE PLATFORM. ENDLESS POSSIBILITIES. GAMER.Productions — Stream. Mod. Sell. Connect. Earn. This is the future of gaming culture! Join NOW! gamer.productions #GamingFuture #AllInOne" },
  { id: 98, category: "Call to Action", platform: "Facebook Group", emoji: "🌍", text: "🌍 Represent your country in the GAMER.Productions gaming community! Gamers from PH, ID, MY, TH, IN, NG & worldwide — we see you! Drop your country flag in the comments! 🏳️ #GlobalGamers #RepYourCountry" },
  { id: 99, category: "Call to Action", platform: "Facebook", emoji: "🎯", text: "🎯 Your goals as a gamer deserve a platform that supports them. GAMER.Productions was built to help YOU succeed — from hobbyist to professional! Start your journey today! 🎮 gamer.productions #GamingGoals #AchieveMore" },
  { id: 100, category: "Call to Action", platform: "Facebook Group", emoji: "🔥", text: "🔥 LAST CHANCE to join the GAMER.Productions launch community! Be part of something BIG from the start! Early members get the best benefits & recognition! 🎮 gamer.productions #EarlyAdopter #GamingRevolution" },
  { id: 101, category: "Referral Program", platform: "Facebook Group", emoji: "🤑", text: "🤑 You + Friends + GAMER.Productions = MONEY! Our referral program rewards both you AND your friends for joining! The more gamers you bring, the more you earn! 💰 Share your link today! #ReferralMoney #GamingReferral" },
  { id: 102, category: "Get Monetised $1", platform: "Facebook", emoji: "🎯", text: "🎯 ATTENTION FILIPINOS! Kumita na sa iyong passion sa gaming! GAMER.Productions Tier 1 — $1/year lang para maging Verified Partner at kumita sa iyong content! 🎮 Sumali na! #PinoyGamer #GamersOfThePhilippines" },
  { id: 103, category: "Start Streaming", platform: "Facebook Group", emoji: "🌐", text: "🌐 Stream from the Philippines to the WORLD on GAMER.Productions! Your gaming content deserves a global audience! Start streaming today — no expensive gear needed! 🎮 #PinoyStreamer #GamingPH" },
];

const CATEGORIES_LIST = [...new Set(ALL_POSTS.map(p => p.category))];

export default function SocialMediaManager() {
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [copied, setCopied] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [cardPost, setCardPost] = useState(null);

  const admin = user && (user.email === "kevinjersey2019@gmail.com" || user.email === "arnoldk137@gmail.com" || user.email === "kevinarnold522@gmail.com");

  const filtered = selectedCategory === "All" ? ALL_POSTS : ALL_POSTS.filter(p => p.category === selectedCategory);

  const handleCopy = (post) => {
    navigator.clipboard.writeText(post.text);
    setCopied(post.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleShareFB = (post) => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://gamer.productions")}&quote=${encodeURIComponent(post.text)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a social media manager for GAMER.Productions — a gaming platform with mods, live streaming, marketplace, communities, daily rewards, and Tier 1 memberships ($1/year). 
        
Create 3 engaging Facebook Group post variations for the following topic: "${aiPrompt}"

Requirements:
- Each post should be enthusiastic, use emojis, and feel authentic to the gaming community
- Include relevant hashtags
- Add a clear call-to-action linking to gamer.productions
- Make posts feel community-driven and exciting
- Keep each post under 300 characters for Facebook sharing

Format your response as:
POST 1:
[post text]

POST 2:
[post text]

POST 3:
[post text]`,
      });
      setAiResult(typeof result === "string" ? result : JSON.stringify(result));
    } catch (e) {
      setAiResult("❌ AI generation failed. Try again.");
    }
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user ? <AuthNavbar user={user} profile={profile} /> : <Navbar />}

      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Social Media Manager</h1>
              <p className="text-gray-400 text-sm">100+ ready-to-post content for GAMER.Productions — copy, customize & share!</p>
            </div>
          </div>
        </motion.div>

        {/* AI Assist Panel */}
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-purple-900/30 to-pink-900/20 border border-purple-700/40">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-5 h-5 text-purple-400" />
            <h2 className="text-white font-black text-lg">AI Content Generator</h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-300 text-[10px] font-bold">AI POWERED</span>
          </div>
          <p className="text-gray-400 text-sm mb-3">Describe what you want to promote and get 3 ready-to-share FB posts instantly!</p>
          <div className="flex gap-3">
            <input
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAiGenerate()}
              placeholder='e.g. "promoting our new GTA 5 mod pack" or "invite people to join the PES community"'
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleAiGenerate}
              disabled={aiLoading || !aiPrompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm disabled:opacity-50 transition-all"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {aiLoading ? "Generating..." : "Generate"}
            </button>
          </div>
          <AnimatePresence>
            {aiResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-gray-900 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-400 font-bold text-sm">✨ AI Generated Posts</p>
                  <button onClick={() => { navigator.clipboard.writeText(aiResult); }} className="text-gray-500 hover:text-white text-xs flex items-center gap-1">
                    <Copy className="w-3 h-3" /> Copy All
                  </button>
                </div>
                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">{aiResult}</pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCategory === "All" ? "bg-purple-600 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}
          >
            All ({ALL_POSTS.length})
          </button>
          {CATEGORIES_LIST.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${selectedCategory === cat ? "bg-purple-600 text-white" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}
            >
              {cat} ({ALL_POSTS.filter(p => p.category === cat).length})
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.02 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-3 hover:border-purple-700/50 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{post.emoji}</span>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 font-bold">{post.category}</span>
                    <p className="text-gray-500 text-[9px] mt-0.5">{post.platform}</p>
                  </div>
                </div>
              </div>

              {/* Post Text */}
              <p className={`text-gray-300 text-xs leading-relaxed ${expandedId === post.id ? "" : "line-clamp-4"}`}>
                {post.text}
              </p>
              {post.text.length > 180 && (
                <button onClick={() => setExpandedId(expandedId === post.id ? null : post.id)} className="text-purple-400 text-[10px] font-bold flex items-center gap-0.5 hover:text-purple-300 self-start">
                  {expandedId === post.id ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                </button>
              )}

              {/* Actions */}
              <div className="flex gap-1.5 mt-auto flex-wrap">
                <button
                  onClick={() => handleCopy(post)}
                  className="flex-1 min-w-[70px] flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-all"
                >
                  {copied === post.id ? <><Check className="w-3 h-3 text-green-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
                <button
                  onClick={() => handleShareFB(post)}
                  className="flex-1 min-w-[70px] flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-700/30 hover:bg-blue-700/50 text-blue-300 text-xs font-bold border border-blue-700/40 transition-all"
                >
                  <Facebook className="w-3 h-3" /> Share
                </button>
                <button
                  onClick={() => setCardPost(post)}
                  className="flex-1 min-w-[70px] flex items-center justify-center gap-1 py-2 rounded-xl bg-purple-700/30 hover:bg-purple-700/50 text-purple-300 text-xs font-bold border border-purple-700/40 transition-all"
                >
                  <ImageIcon className="w-3 h-3" /> Design
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Card Designer Modal */}
      <AnimatePresence>
        {cardPost && <SocialCardCanvas post={cardPost} onClose={() => setCardPost(null)} />}
      </AnimatePresence>
    </div>
  );
}