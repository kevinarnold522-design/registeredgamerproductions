import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Plus, ArrowLeft, Play, Youtube, Link, ExternalLink, Package, Monitor, Gamepad2, CheckCircle, Store, Info, Laptop, Boxes, Megaphone, Wrench, Coffee, Sparkles, AlertTriangle, DollarSign, Save, FolderOpen, Tag, LayoutGrid } from "lucide-react";

const NEWSFEED_TARGETS = [
  { id: "games", label: "Games" },
  { id: "modding", label: "Modding" },
  { id: "premium_mods", label: "Premium Mods" },
  { id: "store", label: "Store" },
  { id: "buy_sell", label: "Buy & Sell" },
  { id: "paid_tools", label: "Tools" },
  { id: "content_streaming", label: "Content" },
];
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { cf } from "@/lib/cfClient";
import { CURRENCY_OPTIONS, getCurrencySymbol } from "@/lib/currency";
import { isAdmin, CATEGORIES, GAMES_STORES } from "@/lib/constants";

const DIGITAL_SUBCATEGORIES = [
  { id: "games", label: "Games / Full Games" },
  { id: "mods", label: "Mods / Modifications" },
  { id: "skins", label: "Skins / Textures" },
  { id: "maps", label: "Custom Maps" },
  { id: "cheats", label: "Cheats / Trainers" },
  { id: "tools", label: "Tools / Utilities" },
  { id: "guides", label: "Guides / Tutorials" },
  { id: "other", label: "Other Digital" },
];

const PHYSICAL_SUBCATEGORIES = [
  { id: "consoles", label: "Gaming Consoles" },
  { id: "controllers", label: "Controllers" },
  { id: "accessories", label: "Accessories" },
  { id: "merchandise", label: "Merchandise" },
  { id: "collectibles", label: "Collectibles" },
  { id: "cables", label: "Cables / Adapters" },
  { id: "other", label: "Other Physical" },
];
import AuthNavbar from "@/components/layout/AuthNavbar";
import AIListingAssistant from "@/components/listings/AIListingAssistant";
import ImageSortableList from "@/components/ImageSortableList";
import SearchableSelect from "@/components/listings/SearchableSelect";
import BrandLogo from "@/components/shared/BrandLogo";
import { uploadFileWithFallback } from "@/lib/uploadToR2";
import { TOP_FRANCHISES } from "@/lib/franchises";
import { supabase } from "@/lib/supabaseClient";

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_LABEL = "25MB";
const LISTING_ORPHAN_CLEANUP_KEY = "listing-orphan-cleanup-at";
const LISTING_ORPHAN_CLEANUP_INTERVAL = 12 * 60 * 60 * 1000;

export default function CreateListing() {
  const { user: authUser, isLoadingAuth } = useAuth();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);
  const videoFileRef = useRef(null);
  const downloadFileRef = useRef(null);
  const pendingUploadsRef = useRef([]);
  const listingSavedRef = useRef(false);
  const cleanupQueuedRef = useRef(false);
  const accessTokenRef = useRef("");

  const params = new URLSearchParams(window.location.search);
  const editId = params.get("edit");
  const defaultCat = params.get("cat") || "buy_sell";
  const defaultSub = params.get("sub") || "";
  const defaultGame = params.get("game") || defaultSub;

  const [gamingCommunities, setGamingCommunities] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState(CATEGORIES);
  const [gameSearch, setGameSearch] = useState("");
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const gameDropdownRef = useRef(null);

  // Each platform maps to a brand logo slug (BrandLogo) when one exists.
  const PLATFORMS = [
    { id: "PC", brand: null },
    { id: "Nintendo Switch", brand: "nintendo" },
    { id: "PlayStation 5", brand: "playstation" },
    { id: "PlayStation 4", brand: "playstation" },
    { id: "PlayStation 3", brand: "playstation" },
    { id: "PlayStation 2", brand: "playstation" },
    { id: "PSP", brand: "playstation" },
    { id: "Android", brand: "googleplay" },
    { id: "PPSSPP", brand: null },
    { id: "Xbox", brand: "xbox" },
    { id: "Steam", brand: "steam" },
  ];
  const COMBINED_AVAILABLE_OPTIONS = [
    ...PLATFORMS.map(p => ({ id: p.id, label: p.id, type: "platform", brand: p.brand })),
    ...GAMES_STORES.map(s => ({ id: s.id, label: s.label, type: "store", color: s.color, iconText: s.iconText, brand: s.id })),
  ];
  const DOWNLOAD_HOSTS = [
    { id: "mediafire", label: "Mediafire", color: "#1E90FF" },
    { id: "modsfire", label: "Modsfire", color: "#FF4500" },
    { id: "mega", label: "Mega", color: "#D9272D" },
    { id: "sharemods", label: "Sharemods", color: "#22C55E" },
  ];

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "0",
    currency: "USD",
    product_type: defaultCat === "premium_mods" ? "digital" : "",
    category: defaultCat,
    subcategories: defaultSub ? [defaultSub] : [],
    newsfeed_categories: [],
    digital_subcategory: "",
    digital_subcategory_custom: "",
    physical_subcategory: "",
    condition: defaultCat === "premium_mods" ? "digital" : "",
    is_premium: defaultCat === "premium_mods",
    platforms: [],
    quantity: 1,
    location: "",
    tags: "",
    keywords: "",
    youtube_url: "",
    video_url: "",
    game_name: defaultGame,
    game_platform: "",
    paypal_email: "",
    external_link: "",
    download_url: "",
    download_host: "",
    card_animation: "fade",
    card_glow_style: "radiant",
    card_glow_color: "purple",
    card_glow_hex: "#a855f7",
    card_glow_speed: "slow",
    listing_theme_color: "#030712",
    card_font_family: "default",
    card_font_color: "#ffffff",
    kofi_url: "",
    buymeacoffee_url: "",
    patreon_url: "",
    community_franchise_id: "",
    modding_subcategory: "",
    cross_post_gaming: false,
    cross_post_modding: false,
    bulk_cross_post_ids: [],
    ign_rating: "",
    store_platforms: [],
    tool_target_game: defaultCat === "premium_mods" ? defaultGame : "",
    preview_video_url: "",
  });

  useEffect(() => {
    // Close game dropdown on outside click
    const handler = (e) => {
      if (gameDropdownRef.current && !gameDropdownRef.current.contains(e.target)) setShowGameDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Build the category/subcategory option list from all existing listings, so
  // newly-added categories & subcategories appear in the pickers in real time.
  const refreshDynamicCategories = async () => {
    try {
      const existing = await base44.entities.Listing.list("-created_date", 200);
      const byCategory = Object.fromEntries(CATEGORIES.map(c => [c.id, { ...c, subcategories: [...(c.subcategories || [])] }]));
      existing.forEach(item => {
        if (item.category && !byCategory[item.category]) byCategory[item.category] = { id: item.category, label: item.category.replace(/_/g, " "), icon: item.category, subcategories: [] };
        const target = byCategory[item.category];
        if (!target) return;
        [...(item.subcategories || []), item.modding_subcategory, item.digital_subcategory, item.physical_subcategory].filter(Boolean).forEach(sub => {
          if (!target.subcategories.includes(sub)) target.subcategories.push(sub);
        });
      });
      setDynamicCategories(Object.values(byCategory));
    } catch { /* keep current categories */ }
  };

  // Realtime: when any listing is created/updated, refresh the category &
  // subcategory options so the pickers stay current without a reload.
  useEffect(() => {
    const unsubscribe = base44.entities.Listing.subscribe(() => { refreshDynamicCategories(); });
    return unsubscribe;
  }, []);

  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Wait for the shared auth context to resolve the Supabase session.
      if (isLoadingAuth) return;
      const me = authUser;
      if (!me?.email) {
        // No session — show a sign-in prompt instead of hanging on the spinner forever.
        setNeedsLogin(true);
        setLoading(false);
        return;
      }
      const ghostSession = (() => {
        try { return JSON.parse(localStorage.getItem("impersonation_session") || "{}"); } catch { return {}; }
      })();
      const ghostEmail = ghostSession.isImpersonating && ghostSession.targetEmail ? ghostSession.targetEmail : null;
      const activeUser = ghostEmail ? { ...me, email: ghostEmail, isGhostAccount: true } : me;
      setUser(activeUser);
      const profiles = await base44.entities.UserProfile.filter({ user_email: activeUser.email });
      if (profiles.length > 0) setProfile(profiles[0]);
      setGamingCommunities(TOP_FRANCHISES.map(f => ({ id: f.id, name: f.name })));
      refreshDynamicCategories();
      if (!editId && defaultGame) setGameSearch(defaultGame);
      if (editId) {
        const l = await base44.entities.Listing.get(editId);
        if (l) {
          setForm({
            title: l.title || "",
            description: l.description || "",
            price: l.price !== undefined ? String(l.price) : "0",
            currency: l.currency === "PHP" ? "USD" : (l.currency || "USD"),
            product_type: l.product_type || "",
            category: l.category || defaultCat,
            subcategories: l.subcategories || [],
            newsfeed_categories: l.newsfeed_categories || [],
            digital_subcategory: l.digital_subcategory || "",
            digital_subcategory_custom: "",
            physical_subcategory: l.physical_subcategory || "",
            condition: l.condition || "digital",
            is_premium: l.is_premium || false,
            platforms: l.platforms || [],
            quantity: l.quantity || 1,
            location: l.location || "",
            tags: (l.tags || []).join(", "),
            keywords: (l.keywords || []).join(", "),
            youtube_url: l.youtube_url || "",
            video_url: l.video_url || "",
            game_name: l.game_name || "",
            game_platform: l.game_platform || "",
            external_link: l.external_link || "",
            download_url: l.download_url || "",
            download_host: l.download_host || "",
            kofi_url: l.kofi_url || "",
            buymeacoffee_url: l.buymeacoffee_url || "",
            patreon_url: l.patreon_url || "",
            community_franchise_id: l.community_franchise_id || "",
            modding_subcategory: l.modding_subcategory || "",
            ign_rating: l.ign_rating != null ? String(l.ign_rating) : "",
            store_platforms: l.store_platforms || [],
            tool_target_game: l.tool_target_game || "",
            preview_video_url: l.preview_video_url || "",
            card_glow_style: l.card_glow_style || "radiant",
            card_glow_color: l.card_glow_color || "purple",
            card_glow_hex: l.card_glow_hex || "#a855f7",
            card_glow_speed: l.card_glow_speed || "slow",
            listing_theme_color: l.listing_theme_color || "#030712",
            card_font_family: l.card_font_family || "default",
            card_font_color: l.card_font_color || "#ffffff",
            bulk_cross_post_ids: [],
          });
          setImages(l.images || []);
          if (l.game_name) setGameSearch(l.game_name);
        }
      }
      setLoading(false);
    };
    init();
  }, [authUser, isLoadingAuth]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) accessTokenRef.current = data?.session?.access_token || "";
    }).catch(() => {});

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      accessTokenRef.current = session?.access_token || "";
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  const rememberPendingUpload = (upload) => {
    if (!upload?.path) return;
    if (pendingUploadsRef.current.some((item) => item.path === upload.path)) return;
    pendingUploadsRef.current = [...pendingUploadsRef.current, upload];
  };

  const forgetPendingUploads = (paths = []) => {
    const removeSet = new Set(paths.filter(Boolean));
    pendingUploadsRef.current = pendingUploadsRef.current.filter((item) => !removeSet.has(item.path));
  };

  const findPendingUploadByUrl = (url) => pendingUploadsRef.current.find((item) => item.file_url === url);

  const stripUploadsFromDraft = (uploads = []) => {
    const urlSet = new Set(uploads.map((item) => item?.file_url).filter(Boolean));
    if (!urlSet.size) return;
    setImages((prev) => prev.filter((url) => !urlSet.has(url)));
    setForm((prev) => ({
      ...prev,
      video_url: urlSet.has(prev.video_url) ? "" : prev.video_url,
      download_url: urlSet.has(prev.download_url) ? "" : prev.download_url,
      preview_video_url: urlSet.has(prev.preview_video_url) ? "" : prev.preview_video_url,
    }));
  };

  const cleanupListingUploads = async (uploads = [], options = {}) => {
    const uniqueUploads = [...new Map(
      uploads
        .filter((item) => item?.path || item?.file_url)
        .map((item) => [item.path || item.file_url, item])
    ).values()];

    if (!uniqueUploads.length && !options.removeOrphans) return { deletedCount: 0 };

    const payload = {
      uploads: uniqueUploads.map((item) => ({
        path: item.path,
        file_url: item.file_url,
        bucket: item.bucket,
      })),
      removeOrphans: options.removeOrphans === true,
    };

    if (options.beacon && accessTokenRef.current && typeof navigator !== "undefined") {
      const blob = new Blob([JSON.stringify({ ...payload, accessToken: accessTokenRef.current })], {
        type: "application/json",
      });
      navigator.sendBeacon(`${cf.API_BASE}/functions/cleanupListingDraftMedia`, blob);
      return { queued: true };
    }

    const res = await base44.functions.invoke("cleanupListingDraftMedia", payload);
    forgetPendingUploads(uniqueUploads.map((item) => item.path));
    return res?.data || { success: true };
  };

  const queueAbandonedDraftCleanup = () => {
    if (cleanupQueuedRef.current || listingSavedRef.current || !pendingUploadsRef.current.length) return;
    cleanupQueuedRef.current = true;
    cleanupListingUploads([...pendingUploadsRef.current], { beacon: true });
  };

  useEffect(() => {
    window.addEventListener("pagehide", queueAbandonedDraftCleanup);
    window.addEventListener("beforeunload", queueAbandonedDraftCleanup);
    return () => {
      queueAbandonedDraftCleanup();
      window.removeEventListener("pagehide", queueAbandonedDraftCleanup);
      window.removeEventListener("beforeunload", queueAbandonedDraftCleanup);
    };
  }, []);

  useEffect(() => {
    if (!user?.email || !isAdmin(user.email)) return;
    try {
      const lastRun = Number(localStorage.getItem(LISTING_ORPHAN_CLEANUP_KEY) || 0);
      if (Date.now() - lastRun < LISTING_ORPHAN_CLEANUP_INTERVAL) return;
      localStorage.setItem(LISTING_ORPHAN_CLEANUP_KEY, String(Date.now()));
    } catch (_) {}

    base44.functions.invoke("cleanupListingDraftMedia", { removeOrphans: true }).catch(() => {});
  }, [user?.email]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const oversized = files.find(file => file.size > MAX_UPLOAD_BYTES);
    if (oversized) {
      alert(`Each file must be ${MAX_UPLOAD_LABEL} or smaller.`);
      e.target.value = "";
      return;
    }
    setUploadingImages(true);
    const uploadedThisAttempt = [];
    try {
      for (const file of files) {
        const upload = await uploadFileWithFallback(file, "listing-images");
        uploadedThisAttempt.push(upload);
        rememberPendingUpload(upload);
      }
      setImages((prev) => [...prev, ...uploadedThisAttempt.map((item) => item.file_url)]);
    } catch (err) {
      if (uploadedThisAttempt.length) {
        await cleanupListingUploads(uploadedThisAttempt).catch(() => {});
      }
      alert(err?.message || "Image upload failed. Please try again.");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      alert(`Video uploads must be ${MAX_UPLOAD_LABEL} or smaller.`);
      e.target.value = "";
      return;
    }
    setUploadingImages(true);
    try {
      const upload = await uploadFileWithFallback(file, "listing-videos");
      rememberPendingUpload(upload);
      setForm(f => ({ ...f, video_url: upload.file_url }));
    } catch (err) {
      alert(err?.message || "Video upload failed. Please try again.");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleDownloadFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      alert(`Download files must be ${MAX_UPLOAD_LABEL} or smaller.`);
      e.target.value = "";
      return;
    }
    setUploadingImages(true);
    try {
      const upload = await uploadFileWithFallback(file, "listing-downloads");
      rememberPendingUpload(upload);
      setForm(f => ({ ...f, download_url: upload.file_url }));
    } catch (err) {
      alert(err?.message || "File upload failed. Please try again.");
    } finally {
      setUploadingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = async (idx) => {
    const removedUrl = images[idx];
    setImages((prev) => prev.filter((_, i) => i !== idx));
    const pendingUpload = findPendingUploadByUrl(removedUrl);
    if (pendingUpload) {
      await cleanupListingUploads([pendingUpload]).catch(() => {});
    }
  };

  const removeUploadedField = async (field) => {
    const url = form[field];
    setForm((prev) => ({ ...prev, [field]: "" }));
    const pendingUpload = findPendingUploadByUrl(url);
    if (pendingUpload) {
      await cleanupListingUploads([pendingUpload]).catch(() => {});
    }
  };

  const collectListingMediaUrls = (listingLike = {}) => {
    const urls = [];
    if (Array.isArray(listingLike.images)) urls.push(...listingLike.images.filter(Boolean));
    ["video_url", "download_url", "preview_video_url"].forEach((field) => {
      if (listingLike[field]) urls.push(listingLike[field]);
    });
    return urls;
  };

  const [moderationResult, setModerationResult] = useState(null);
  const [savedFilters, setSavedFilters] = useState(() => {
    try { return JSON.parse(localStorage.getItem("listing_saved_filters") || "[]"); } catch { return []; }
  });
  const [filterName, setFilterName] = useState("");
  const [showSaveFilter, setShowSaveFilter] = useState(false);
  const [showLoadFilter, setShowLoadFilter] = useState(false);

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    const filterData = {
      name: filterName,
      data: {
        product_type: form.product_type,
        category: form.category,
        subcategories: form.subcategories,
        digital_subcategory: form.digital_subcategory,
        physical_subcategory: form.physical_subcategory,
        condition: form.condition,
        is_premium: form.is_premium,
        platforms: form.platforms,
        store_platforms: form.store_platforms,
        game_platform: form.game_platform,
        tags: form.tags,
        card_animation: form.card_animation,
        card_glow_style: form.card_glow_style,
        card_glow_color: form.card_glow_color,
        card_glow_hex: form.card_glow_hex,
        card_glow_speed: form.card_glow_speed,
        listing_theme_color: form.listing_theme_color,
        community_franchise_id: form.community_franchise_id,
        modding_subcategory: form.modding_subcategory,
        kofi_url: form.kofi_url,
        buymeacoffee_url: form.buymeacoffee_url,
        patreon_url: form.patreon_url,
        download_host: form.download_host,
      }
    };
    const updated = [...savedFilters.filter(f => f.name !== filterName), filterData];
    setSavedFilters(updated);
    localStorage.setItem("listing_saved_filters", JSON.stringify(updated));
    setFilterName("");
    setShowSaveFilter(false);
  };

  const handleLoadFilter = (filter) => {
    setForm(f => ({ ...f, ...filter.data, title: f.title, external_link: f.external_link }));
    setShowLoadFilter(false);
  };

  const handleDeleteFilter = (name) => {
    const updated = savedFilters.filter(f => f.name !== name);
    setSavedFilters(updated);
    localStorage.setItem("listing_saved_filters", JSON.stringify(updated));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModerationResult(null);

    try {
    // Run AI content moderation first (don't block posting if it fails/times out)
    let mod = null;
    try {
      const modRes = await base44.functions.invoke("moderateListing", {
        title: form.title,
        description: form.description,
        category: form.category,
      });
      mod = modRes?.data;
    } catch (_) { mod = null; }

    const ytId = extractYouTubeId(form.youtube_url) || extractYouTubeId(form.preview_video_url);
    const priceVal = parseFloat(form.price) || 0;
    const existingListing = editId ? await base44.entities.Listing.get(editId) : null;
    const sellerEmail = existingListing?.seller_email || user.email;
    const sellerName = existingListing?.seller_username || profile?.username || profile?.display_name || sellerEmail?.split("@")[0] || "Gamer";
    const data = {
      ...form,
      digital_subcategory: form.digital_subcategory_custom?.trim() || form.digital_subcategory,
      digital_subcategory_custom: undefined,
      price: priceVal,
      currency: form.currency === "PHP" ? "USD" : (form.currency || "USD"),
      is_free: priceVal === 0,
      // All paid mods are automatically Premium
      is_premium: form.is_premium || ((form.category === "modding" || form.category === "premium_mods") && priceVal > 0),
      // Every listing is treated as digital content
      product_type: form.product_type || "digital",
      // Donation links only apply to paid listings — clear them on free ones
      kofi_url: priceVal > 0 ? form.kofi_url : "",
      buymeacoffee_url: priceVal > 0 ? form.buymeacoffee_url : "",
      patreon_url: priceVal > 0 ? form.patreon_url : "",
      stock: parseInt(form.quantity) || 1,
      quantity: parseInt(form.quantity) || 1,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      keywords: form.keywords.split(",").map(t => t.trim()).filter(Boolean),
      images,
      youtube_video_id: ytId || undefined,
      seller_email: sellerEmail,
      seller_username: sellerName,
      seller_paypal_email: form.paypal_email || undefined,
      external_link: form.external_link || undefined,
      card_glow_style: form.card_glow_style,
      card_glow_color: form.card_glow_color,
      card_glow_hex: form.card_glow_hex,
      card_glow_speed: form.card_glow_speed,
      listing_theme_color: form.listing_theme_color,
      card_font_family: form.card_font_family,
      card_font_color: form.card_font_color,
      subcategories: Array.isArray(form.subcategories) ? form.subcategories : (form.subcategory ? [form.subcategory] : []),
      modding_subcategory: form.modding_subcategory || undefined,
      subcategory: undefined,
      platform: undefined,
      ign_rating: form.ign_rating !== "" ? parseFloat(form.ign_rating) : undefined,
      store_platforms: form.store_platforms || [],
      tool_target_game: (form.category === "paid_tools" || form.category === "premium_mods") ? (form.tool_target_game || form.game_name || undefined) : undefined,
      preview_video_url: form.preview_video_url || undefined,
      is_approved: mod?.is_approved !== false,
      status: mod?.requiresReview ? "pending" : "active",
    };

    if (form.category === "games") {
      data.community_franchise_id = undefined;
      data.bulk_cross_post_ids = [];
    }

    // Games category: non-admin submissions require admin approval (go to pending queue).
    const userIsAdmin = isAdmin(user.email);
    if (form.category === "games" && !userIsAdmin && !editId) {
      data.status = "pending";
      data.is_approved = false;
    }
    let savedListing;
    if (editId) {
      savedListing = await base44.entities.Listing.update(editId, data);
    } else {
      savedListing = await base44.entities.Listing.create(data);
    }

    const removedExistingMedia = existingListing
      ? collectListingMediaUrls(existingListing).filter((url) => !collectListingMediaUrls(data).includes(url))
      : [];

    listingSavedRef.current = true;
    cleanupQueuedRef.current = true;
    pendingUploadsRef.current = [];
    if (removedExistingMedia.length) {
      base44.functions.invoke("cleanupListingDraftMedia", {
        uploads: removedExistingMedia.map((url) => ({ file_url: url })),
      }).catch(() => {});
    }

    // Note: listings are surfaced in community/category newsfeeds via their
    // category, community_franchise_id, modding_subcategory & newsfeed_categories
    // fields directly — no auto-generated "New listing" announcement posts.

    if (mod?.requiresReview) {
      setModerationResult(mod);
    } else if (savedListing?.id) {
      window.location.href = `/listing?id=${savedListing.id}`;
    } else {
      window.location.href = "/dashboard?tab=listings";
    }
    } catch (err) {
      const pendingUploads = [...pendingUploadsRef.current];
      if (pendingUploads.length) {
        await cleanupListingUploads(pendingUploads).catch(() => {});
        stripUploadsFromDraft(pendingUploads);
      }
      alert(err?.message || "Could not save your post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedCat = dynamicCategories.find(c => c.id === form.category) || CATEGORIES.find(c => c.id === form.category);
  const ytId = extractYouTubeId(form.youtube_url);
  const isDigital = form.product_type === "digital";
  const isPhysical = form.product_type === "physical";

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (needsLogin) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 text-center">
      <Gamepad2 className="w-12 h-12 text-purple-400 mb-4" />
      <h2 className="text-xl font-black text-white mb-2">Sign in to post</h2>
      <p className="text-gray-400 text-sm mb-6 max-w-sm">You need to be logged in to create a listing, add a game, or post.</p>
      <button
        onClick={() => base44.auth.loginWithProvider("google", window.location.pathname + window.location.search)}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity"
      >
        Sign in with Google
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <AuthNavbar user={user} profile={profile} />
      <div className="pt-24 max-w-3xl mx-auto px-4 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <a href="/dashboard?tab=listings" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-2xl font-black text-white">{editId ? "Edit Listing" : form.category === "games" ? "Add a Game" : form.category === "premium_mods" ? "Sell a Premium Mod" : "Post"}</h1>
          <div className="ml-auto flex flex-col items-end gap-2">
            <p className="text-cyan-400/70 text-[10px] text-right max-w-xs leading-tight italic">Autopopulates the same taggings, SEO taggings, Gaming Community &amp; Modding Community as well as Gaming Platform if your posting similar contents</p>
            <div className="flex gap-2">
            {savedFilters.length > 0 && (
              <button type="button" onClick={() => setShowLoadFilter(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/50 transition-colors">
                <FolderOpen className="w-3 h-3" /> Load Filter ({savedFilters.length})
              </button>
            )}
            <button type="button" onClick={() => setShowSaveFilter(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-bold hover:bg-purple-900/50 transition-colors">
              <Save className="w-3 h-3" /> Save Filter
            </button>
            </div>
          </div>
        </div>

        {/* Save Filter Modal */}
        {showSaveFilter && (
          <div className="mb-6 p-4 bg-gray-900 rounded-2xl border border-purple-700/50">
            <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Save className="w-4 h-4 text-purple-300" /> Save Current Settings as Filter</p>
            <p className="text-gray-500 text-xs mb-3">Saves everything except listing title and external link. Load it anytime for new listings.</p>
            <div className="flex gap-2">
              <input value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="Filter name (e.g. GTA Mods Setup)"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
              <button type="button" onClick={handleSaveFilter} disabled={!filterName.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-purple-700 transition-colors">Save</button>
              <button type="button" onClick={() => setShowSaveFilter(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Load Filter Panel */}
        {showLoadFilter && (
          <div className="mb-6 p-4 bg-gray-900 rounded-2xl border border-cyan-700/40">
            <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FolderOpen className="w-4 h-4 text-cyan-300" /> Load Saved Filter</p>
            <div className="space-y-2">
              {savedFilters.map(f => (
                <div key={f.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                  <span className="text-white text-sm font-semibold">{f.name}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleLoadFilter(f)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-colors">Load</button>
                    <button type="button" onClick={() => handleDeleteFilter(f.name)}
                      className="px-3 py-1.5 rounded-lg bg-red-900/40 text-red-400 text-xs font-bold hover:bg-red-900/60 transition-colors">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AIListingAssistant form={form} setForm={setForm} images={images} setImages={setImages} />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" /> Photos & Images
            </h3>
            <p className="text-gray-500 text-xs mb-3">Maximum upload size: {MAX_UPLOAD_LABEL} per file.</p>
            <p className="text-gray-400 text-xs mb-3">Hold and drag an image to rearrange it. The first image becomes the cover.</p>
            <div className="mb-3">
              <ImageSortableList images={images} onReorder={setImages} onRemove={removeImage} />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="aspect-square flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500 transition-colors text-gray-500 hover:text-purple-400">
                <Plus className="w-6 h-6" />
                <span className="text-xs">Add Photo</span>
              </button>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            {uploadingImages && <p className="text-purple-400 text-sm animate-pulse">Uploading...</p>}
          </div>

          {/* Video / YouTube */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Play className="w-4 h-4 text-red-400" /> Video Content
            </h3>

            {/* YouTube URL */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Youtube className="w-3 h-3 text-red-400" /> YouTube URL (optional)
              </label>
              <input value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm" />
              {ytId && (
                <div className="mt-2 rounded-xl overflow-hidden aspect-video">
                  <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="YouTube thumbnail" className="w-full h-full object-cover" />
                  <p className="text-green-400 text-xs mt-1">YouTube video detected!</p>
                </div>
              )}
            </div>

            {/* Upload video file */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Upload Video File (optional, max {MAX_UPLOAD_LABEL})</label>
              {form.video_url ? (
                <div className="flex items-center gap-3">
                  <video src={form.video_url} controls className="w-48 rounded-xl" />
                  <button type="button" onClick={() => removeUploadedField("video_url")} className="text-red-400 text-xs hover:text-red-300">Remove</button>
                </div>
              ) : (
                <button type="button" onClick={() => videoFileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-700 hover:border-blue-500 text-gray-500 hover:text-blue-400 text-sm transition-colors">
                  <Upload className="w-4 h-4" /> Upload Video
                </button>
              )}
              <input ref={videoFileRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
            </div>

            {/* Universal preview media — YouTube link OR uploaded video, any category */}
            <div className="pt-2 border-t border-gray-800">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Play className="w-3 h-3 text-purple-400" /> Product Preview Media (optional)</label>
              <p className="text-gray-500 text-xs mb-2">Paste a YouTube link, or it uses the uploaded video above. Shows as a preview across the platform.</p>
              <input value={form.preview_video_url} onChange={e => setForm({ ...form, preview_video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=... (or leave blank)"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
          </div>

          {/* Download File / External Link */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-green-400" /> Download / Access Options
            </h3>
            <p className="text-gray-500 text-xs">Choose one or both: upload a file from your device, or paste an external link. When buyers click "Download", they'll be routed there.</p>

            {/* Upload file from device */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Upload className="w-3 h-3 text-purple-400" /> Upload File from Device
              </label>
              <p className="text-gray-500 text-xs mb-2">Maximum file size: {MAX_UPLOAD_LABEL}.</p>
              {form.download_url ? (
                <div className="flex items-center gap-3 bg-green-900/20 border border-green-700/40 rounded-xl p-3">
                <span className="text-green-400 text-sm flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> File uploaded</span>
                  <a href={form.download_url} target="_blank" rel="noopener noreferrer" className="text-green-400 text-xs underline">Preview</a>
                  <button type="button" onClick={() => removeUploadedField("download_url")} className="ml-auto text-red-400 text-xs hover:text-red-300">Remove</button>
                </div>
              ) : (
                <button type="button" onClick={() => downloadFileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-3 w-full rounded-xl border-2 border-dashed border-gray-700 hover:border-purple-500 text-gray-500 hover:text-purple-400 text-sm transition-colors justify-center">
                  <Upload className="w-4 h-4" /> Click to connect & upload from your device
                </button>
              )}
              <input ref={downloadFileRef} type="file" onChange={handleDownloadFileUpload} className="hidden" />
            </div>

            {/* External link */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">External Link (Google Drive, Mega, etc.)</label>
              <input
                value={form.external_link}
                onChange={e => setForm({ ...form, external_link: e.target.value })}
                placeholder="https://drive.google.com/... or any external link"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm"
              />
              {form.external_link && (
                <a href={form.external_link} target="_blank" rel="noopener noreferrer" className="text-green-400 text-xs underline flex items-center gap-1 mt-1">
                  <ExternalLink className="w-3 h-3" /> Preview link
                </a>
              )}
            </div>

            {/* Download Host Selector */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Download Host (shown as logo on listing)</label>
              <div className="flex flex-wrap gap-3">
                {DOWNLOAD_HOSTS.map(h => (
                  <button key={h.id} type="button"
                    onClick={() => setForm(f => ({ ...f, download_host: f.download_host === h.id ? "" : h.id }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${form.download_host === h.id ? "border-opacity-100 text-white" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500"}`}
                    style={form.download_host === h.id ? { borderColor: h.color, background: `${h.color}22`, color: h.color } : {}}>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: h.color }} />
                    {h.label}
                    {form.download_host === h.id && <CheckCircle className="w-3 h-3" />}
                  </button>
                ))}
              </div>
              {form.download_host && <p className="text-green-400 text-xs mt-2 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> {DOWNLOAD_HOSTS.find(h => h.id === form.download_host)?.label} logo will display on your listing</p>}
            </div>
          </div>

          {/* Product Type Selection */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-700/50 p-6">
            <h3 className="text-white font-black text-lg mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-300" /> Product Type
            </h3>
            <p className="text-gray-400 text-sm mb-4">Select whether you're selling a digital download or physical item</p>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setForm({ ...form, product_type: "digital", condition: "digital" })}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${form.product_type === "digital" ? "bg-purple-900/40 border-purple-500 shadow-lg shadow-purple-500/20" : "bg-gray-800 border-gray-700 hover:border-purple-500/50"}`}>
                <Laptop className="w-9 h-9 text-purple-300" />
                <span className="text-white font-bold text-sm">Digital Product</span>
                <span className="text-gray-400 text-xs text-center">Mods, skins, maps, tools, guides</span>
              </button>
              <button type="button" onClick={() => setForm({ ...form, product_type: "physical", condition: "new" })}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${form.product_type === "physical" ? "bg-pink-900/40 border-pink-500 shadow-lg shadow-pink-500/20" : "bg-gray-800 border-gray-700 hover:border-pink-500/50"}`}>
                <Gamepad2 className="w-9 h-9 text-pink-300" />
                <span className="text-white font-bold text-sm">Physical Product</span>
                <span className="text-gray-400 text-xs text-center">Consoles, controllers, merch</span>
              </button>
            </div>
            {form.product_type && (
              <div className="mt-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                <p className="text-green-400 text-xs font-semibold flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Selected: {form.product_type === "digital" ? "Digital Download" : "Physical Item"}</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Listing Details</h3>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="What are you selling?"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>

            {form.category === "games" && (
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
                <label className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Gamepad2 className="w-3 h-3" /> Game Platform Text
                </label>
                <p className="text-gray-500 text-xs mb-2">Manually add platform notes shown on the game listing, like PC, PS5, Android, or Steam.</p>
                <input value={form.game_platform} onChange={e => setForm({ ...form, game_platform: e.target.value })}
                  placeholder="e.g. PC / Steam / PS5 / Android"
                  className="w-full bg-gray-800 border border-blue-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
            )}

            {/* Game Title — searchable dropdown from GamingCommunities */}
            <div ref={gameDropdownRef} className="relative">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Game Title</label>
              <input
                value={gameSearch}
                onChange={e => { setGameSearch(e.target.value); setForm(f => ({ ...f, game_name: e.target.value })); setShowGameDropdown(true); }}
                onFocus={() => setShowGameDropdown(true)}
                placeholder="Search gaming communities..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
              />
              {showGameDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {gamingCommunities.filter(c => c.name.toLowerCase().includes(gameSearch.toLowerCase())).slice(0, 20).map(c => (
                    <button key={c.id} type="button"
                      onClick={() => { setGameSearch(c.name); setForm(f => ({ ...f, game_name: c.name, community_franchise_id: f.category === "games" ? "" : c.id })); setShowGameDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 text-white text-sm hover:bg-purple-900/40 transition-colors border-b border-gray-800/50 last:border-0">
                      {c.name}
                    </button>
                  ))}
                  {gamingCommunities.filter(c => c.name.toLowerCase().includes(gameSearch.toLowerCase())).length === 0 && (
                    <p className="px-4 py-3 text-gray-500 text-sm">No matching games found</p>
                  )}
                </div>
              )}
            </div>

            {/* Combined Platform + Store Multi-Select */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Monitor className="w-3 h-3 text-purple-400" /> Available On & Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {COMBINED_AVAILABLE_OPTIONS.map(option => {
                  const selected = option.type === "platform" ? (form.platforms || []).includes(option.id) : (form.store_platforms || []).includes(option.id);
                  return (
                    <button key={`${option.type}-${option.id}`} type="button"
                      onClick={() => setForm(f => option.type === "platform"
                        ? ({ ...f, platforms: selected ? (f.platforms || []).filter(x => x !== option.id) : [...(f.platforms || []), option.id] })
                        : ({ ...f, store_platforms: selected ? (f.store_platforms || []).filter(x => x !== option.id) : [...(f.store_platforms || []), option.id] })
                      )}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selected ? "bg-purple-600 text-white border border-purple-500" : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-purple-500/50"}`}>
                      {option.brand
                        ? <span className="inline-flex h-4 w-4 items-center justify-center"><BrandLogo brand={option.brand} label={option.label} className="w-3.5 h-3.5" /></span>
                        : option.type === "store" && <span className="inline-flex h-4 min-w-4 items-center justify-center rounded bg-white/15 px-1 text-[8px] font-black">{option.iconText}</span>}
                      {option.label}
                      {selected && <CheckCircle className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
              <p className="text-gray-600 text-xs mt-2">Select both device platforms and stores from one place.</p>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5}
                placeholder="Describe your listing in detail — include game version, what's included, installation steps if needed..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none" />
            </div>

            {/* Free / Paid Toggle */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Pricing</label>
              <div className="flex gap-3 mb-3">
                <button type="button" onClick={() => setForm({ ...form, price: "0" })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${form.price === "0" || form.price === 0 ? "bg-green-900/40 border-2 border-green-500/70 text-green-400" : "bg-gray-800 border border-gray-700 text-gray-400"}`}>
                  Free
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, price: f.price === "0" || f.price === 0 ? "" : f.price }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${form.price !== "0" && form.price !== 0 && form.price !== "" ? "bg-purple-900/40 border-2 border-purple-500/70 text-purple-400" : "bg-gray-800 border border-gray-700 text-gray-400"}`}>
                  <DollarSign className="w-4 h-4 inline mr-1" /> Set Price
                </button>
              </div>
              {(form.price !== "0" && form.price !== 0) && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select value={form.currency === "PHP" ? "USD" : (form.currency || "USD")} onChange={e => setForm({ ...form, currency: e.target.value })}
                      className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                      {CURRENCY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>)}
                    </select>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required min="1" placeholder={`Enter price in ${getCurrencySymbol(form.currency === "PHP" ? "USD" : (form.currency || "USD"))}`}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Quantity</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} min={1}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
          </div>

          {/* Category & Subcategories */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Category & Placement</h3>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Main Category *</label>
              <SearchableSelect
                value={form.category}
                onChange={(val) => setForm({ ...form, category: val, community_franchise_id: val === "games" ? "" : form.community_franchise_id, bulk_cross_post_ids: val === "games" ? [] : form.bulk_cross_post_ids })}
                options={dynamicCategories.map(c => ({ value: c.id, label: c.label }))}
                placeholder="Select a category"
              />
            </div>

            {/* GAMES category — IGN rating + store platforms */}
            {form.category === "games" && (
              <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-4 space-y-4">
                <div>
                  <label className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> IGN Rating (out of 10)</label>
                  <input type="number" step="0.1" min="0" max="10" value={form.ign_rating}
                    onChange={e => setForm({ ...form, ign_rating: e.target.value })}
                    placeholder="e.g. 9.5"
                    className="w-full bg-gray-800 border border-emerald-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm" />
                  <p className="text-emerald-400/70 text-xs mt-1">Numbers only, one decimal (e.g. 9.5)</p>
                </div>
                <div>
                  <label className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Game Subcategory</label>
                  <select value={form.subcategories?.[0] || ""} onChange={e => setForm({ ...form, subcategories: e.target.value ? [e.target.value] : [] })}
                    className="w-full bg-gray-800 border border-emerald-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm">
                    <option value="">— Select type —</option>
                    <option value="Games">Games</option>
                    <option value="How To / Guides">How To / Guides</option>
                  </select>
                </div>
                {!isAdmin(user?.email) && !editId && (
                  <p className="text-yellow-400/80 text-xs flex items-center gap-1.5"><Info className="w-3 h-3" /> Game submissions require admin approval before going live.</p>
                )}
              </div>
            )}

            {/* PREMIUM MODS category — dedicated subcategory (hides unrelated subs) */}
            {form.category === "premium_mods" && (
              <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4">
                <label className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Premium Mod Subcategory</label>
                <select value={form.subcategories?.[0] || ""} onChange={e => setForm({ ...form, subcategories: e.target.value ? [e.target.value] : [] })}
                  className="w-full bg-gray-800 border border-amber-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 text-sm">
                  <option value="">— Select premium mod type —</option>
                  {(CATEGORIES.find(c => c.id === "premium_mods")?.subcategories || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {/* TOOLS category — manual target game */}
            {form.category === "paid_tools" && (
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
                <label className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Wrench className="w-3 h-3" /> What game is this tool for?</label>
                <input value={form.tool_target_game} onChange={e => setForm({ ...form, tool_target_game: e.target.value })}
                  placeholder="e.g. NBA 2K26, Football Life, GTA V, Valorant"
                  className="w-full bg-gray-800 border border-blue-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
            )}

            {/* Product-type specific subcategory */}
            {form.product_type === "digital" && (
              <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4">
                <label className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <Laptop className="w-3 h-3 text-purple-300" /> Digital Product Subcategory
                </label>
                <select value={form.digital_subcategory} onChange={e => setForm({ ...form, digital_subcategory: e.target.value })}
                  className="w-full bg-gray-800 border border-purple-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                  <option value="">Select digital subcategory</option>
                  {DIGITAL_SUBCATEGORIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                {form.digital_subcategory && (
                  <p className="text-purple-400 text-xs mt-2">This will be auto-categorized under Digital: {DIGITAL_SUBCATEGORIES.find(s => s.id === form.digital_subcategory)?.label}</p>
                )}
                <div className="mt-3">
                  <label className="text-purple-300/80 text-[11px] font-semibold uppercase tracking-wider mb-1.5 block">Or type a custom subcategory</label>
                  <input value={form.digital_subcategory_custom || ""} onChange={e => setForm({ ...form, digital_subcategory_custom: e.target.value })}
                    placeholder="e.g. Emulators, Save Files, ROM Hacks..."
                    className="w-full bg-gray-800 border border-purple-700/40 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-sm" />
                  <p className="text-gray-500 text-[11px] mt-1">Leave blank to use the dropdown above. A custom value overrides it.</p>
                </div>
              </div>
            )}

            {form.product_type === "physical" && (
              <div className="bg-pink-900/20 border border-pink-700/40 rounded-xl p-4">
                <label className="text-pink-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <Boxes className="w-3 h-3 text-pink-300" /> Physical Product Subcategory
                </label>
                <select value={form.physical_subcategory} onChange={e => setForm({ ...form, physical_subcategory: e.target.value })}
                  className="w-full bg-gray-800 border border-pink-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 text-sm">
                  <option value="">Select physical subcategory</option>
                  {PHYSICAL_SUBCATEGORIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                {form.physical_subcategory && (
                  <p className="text-pink-400 text-xs mt-2">This will be auto-categorized under Physical: {PHYSICAL_SUBCATEGORIES.find(s => s.id === form.physical_subcategory)?.label}</p>
                )}
              </div>
            )}

            {/* Gaming Community — mandatory except standalone Games posts */}
            {form.category !== "games" && <div className="bg-cyan-900/20 border border-cyan-500/60 rounded-xl p-4">
              <label className="text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Gamepad2 className="w-3 h-3 text-cyan-300" /> Gaming Community <span className="text-red-400 ml-1">*</span>
              </label>
              <p className="text-gray-500 text-xs mb-2">Your listing will appear in the selected gaming community feed. Required.</p>
              <SearchableSelect
                value={form.community_franchise_id}
                onChange={(val) => setForm({ ...form, community_franchise_id: val })}
                options={TOP_FRANCHISES.map(f => ({ value: f.id, label: `${f.name} (${f.genre})` }))}
                placeholder="— Select a Gaming Community —"
                borderClass="border-cyan-500/70 focus-within:border-cyan-400"
              />
              {form.community_franchise_id && (
                <p className="text-cyan-400 text-xs mt-2 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Will be shared with {TOP_FRANCHISES.find(f => f.id === form.community_franchise_id)?.name}</p>
              )}
            </div>}

            {/* Bulk Cross-Posting - Multiple Gaming Communities */}
            {form.category !== "games" && <div className="bg-purple-900/20 border border-purple-500/60 rounded-xl p-4">
              <label className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Megaphone className="w-3 h-3 text-purple-300" /> Bulk Cross-Posting (Optional)
              </label>
              <p className="text-gray-500 text-xs mb-3">Share your listing to multiple gaming communities at once</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {TOP_FRANCHISES.filter(f => f.id !== form.community_franchise_id).map(f => {
                  const selected = form.bulk_cross_post_ids.includes(f.id);
                  return (
                    <button key={f.id} type="button"
                      onClick={() => setForm(f => ({ 
                        ...f, 
                        bulk_cross_post_ids: selected 
                          ? f.bulk_cross_post_ids.filter(id => id !== f.id)
                          : [...f.bulk_cross_post_ids, f.id]
                      }))}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all text-left ${selected ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-purple-900/30"}`}>
                      {f.name}
                    </button>
                  );
                })}
              </div>
              {form.bulk_cross_post_ids.length > 0 && (
                <p className="text-purple-400 text-xs mt-2 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Will cross-post to {form.bulk_cross_post_ids.length} communities</p>
              )}
            </div>}

            {/* Modding Community Subcategory — optional, never for Games listings */}
            {form.category !== "games" && <div className="bg-orange-900/20 border border-orange-700/40 rounded-xl p-4">
              <label className="text-orange-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Wrench className="w-3 h-3 text-orange-300" /> Modding Community Subcategory (Optional)
              </label>
              <select value={form.modding_subcategory} onChange={e => setForm({ ...form, modding_subcategory: e.target.value })}
                className="w-full bg-gray-800 border border-orange-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm">
                <option value="">— Not a mod listing —</option>
                <option value="WWE2K">WWE2K Mods</option>
                <option value="Football Life">Football Life / PES Mods</option>
                <option value="GTA 5">GTA 5 Mods</option>
                <option value="GTA SA">GTA San Andreas Mods</option>
                <option value="GTA 4">GTA 4 Mods</option>
                <option value="FIFA">FIFA / EA FC Mods</option>
                <option value="NBA2K">NBA2K Mods</option>
                <option value="PES">PES Option Files</option>
                <option value="PPSSPP/PSP">PPSSPP / PSP ISOs</option>
                <option value="PS2">PS2 Mods</option>
                <option value="Android">Android Mods / APKs</option>
                <option value="PC">PC Mods &amp; Trainers</option>
              </select>
              {form.modding_subcategory && (
                <p className="text-orange-400 text-xs mt-2 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Also listed in Modding: {form.modding_subcategory}</p>
              )}
            </div>}

            {/* Store Subcategory — for paid/premium listings in buy_sell category */}
            {(form.price > 0 || form.is_premium) && form.category === "buy_sell" && (
              <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4">
                <label className="text-green-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <Store className="w-3 h-3 text-green-300" /> Store Subcategory (Required for paid listings)
                </label>
                <select
                  required
                  value={form.subcategories?.[0] || ""}
                  onChange={e => setForm({ ...form, subcategories: [e.target.value] })}
                  className="w-full bg-gray-800 border border-green-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 text-sm">
                  <option value="">— Select Store Subcategory —</option>
                  <option value="consoles">Gaming Consoles</option>
                  <option value="controllers">Controllers</option>
                  <option value="accessories">Accessories</option>
                  <option value="merchandise">Merchandise</option>
                  <option value="collectibles">Collectibles</option>
                  <option value="digital">Digital Products</option>
                  <option value="mods">Mods &amp; Tools</option>
                  <option value="games">Games</option>
                  <option value="cables">Cables / Adapters</option>
                  <option value="other">Other</option>
                </select>
                {form.subcategories?.[0] && (
                  <p className="text-green-400 text-xs mt-2 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Will be posted to Store: {form.subcategories[0]}</p>
                )}
              </div>
            )}

            {/* Additional subcategories (multi-select) — hidden for Games & Premium Mods which use their own selector */}
            {form.category !== "games" && form.category !== "premium_mods" && <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Additional Subcategories (Optional)</label>
              <p className="text-gray-500 text-xs mb-3">Show your listing in multiple subcategories for more visibility</p>
              {selectedCat?.subcategories?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedCat.subcategories.map(s => {
                    const isSelected = form.subcategories.includes(s);
                    const atMax = form.subcategories.length >= 3 && !isSelected;
                    return (
                      <button key={s} type="button"
                        disabled={atMax}
                        onClick={() => {
                          if (isSelected) {
                            setForm(f => ({ ...f, subcategories: f.subcategories.filter(x => x !== s) }));
                          } else if (!atMax) {
                            setForm(f => ({ ...f, subcategories: [...f.subcategories, s] }));
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isSelected ? "bg-purple-600 text-white" : atMax ? "bg-gray-800/40 text-gray-600 cursor-not-allowed" : "bg-gray-800 text-gray-400 hover:bg-purple-900/30"}`}>
                        {s} {isSelected && <CheckCircle className="w-3 h-3 inline ml-1" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-xs italic">No subcategories available for this category</p>
              )}
              <div className="flex items-center justify-between mt-2">
                {form.subcategories.length > 0 && (
                  <p className="text-green-400 text-xs flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> {form.subcategories.length}/3 subcategories selected</p>
                )}
                {form.subcategories.length >= 3 && (
                  <p className="text-yellow-400 text-xs">Maximum 3 subcategories reached</p>
                )}
              </div>
            </div>}

            {/* Newsfeed visibility — manually pick which categories this shows in (not for Games) */}
            {form.category !== "games" && <div className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl p-4">
              <label className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                <LayoutGrid className="w-3 h-3 text-indigo-300" /> Show in Newsfeeds (Optional)
              </label>
              <p className="text-gray-500 text-xs mb-3">Pick which category newsfeeds this listing also appears in. Leave empty to use its main category only.</p>
              <div className="flex flex-wrap gap-2">
                {NEWSFEED_TARGETS.map(t => {
                  const sel = (form.newsfeed_categories || []).includes(t.id);
                  return (
                    <button key={t.id} type="button"
                      onClick={() => setForm(f => ({ ...f, newsfeed_categories: sel ? (f.newsfeed_categories || []).filter(x => x !== t.id) : [...(f.newsfeed_categories || []), t.id] }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sel ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-indigo-900/30"}`}>
                      {t.label} {sel && <CheckCircle className="w-3 h-3 inline ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Condition</label>
              <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                {form.product_type === "physical" ? (
                  <>
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </>
                ) : (
                  <option value="digital">Digital Download</option>
                )}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="gaming, mod, fps..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Tag className="w-3 h-3" /> SEO Keywords (comma separated)</label>
              <input value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="buy gta mod, ps5 controller cheap, gaming skin..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
              <p className="text-gray-600 text-xs mt-1">Keywords help buyers discover your listing via search engines</p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.is_premium} onChange={e => setForm({ ...form, is_premium: e.target.checked })} className="w-4 h-4 rounded accent-purple-600" />
              <span className="text-gray-300 text-sm font-medium">Mark as Premium listing</span>
            </label>
          </div>

          {/* Support / Donation Links — only for PAID listings (not free mods) */}
          {(parseFloat(form.price) || 0) > 0 && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Coffee className="w-4 h-4 text-orange-300" /> Support & Donation Links
            </h3>
            <p className="text-gray-500 text-xs">Let your fans support you directly via Ko-fi, Buy Me a Coffee, or Patreon</p>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                <Coffee className="w-3 h-3 text-orange-400" /> Ko-fi URL
              </label>
              <input value={form.kofi_url} onChange={e => setForm({ ...form, kofi_url: e.target.value })}
                placeholder="https://ko-fi.com/yourname"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                <Coffee className="w-3 h-3 text-yellow-400" /> Buy Me a Coffee URL
              </label>
              <input value={form.buymeacoffee_url} onChange={e => setForm({ ...form, buymeacoffee_url: e.target.value })}
                placeholder="https://buymeacoffee.com/yourname"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 text-sm" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                <DollarSign className="w-3 h-3 text-red-400" /> Patreon URL
              </label>
              <input value={form.patreon_url} onChange={e => setForm({ ...form, patreon_url: e.target.value })}
                placeholder="https://patreon.com/yourname"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm" />
            </div>
          </div>
          )}

          {/* Card Animation Style */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-300" /> Card Animation & Glow Style
            </h3>
            <p className="text-gray-500 text-xs">Choose how your listing card animates and what glow lines it uses across the platform</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: "fade", label: "Fade In", desc: "Smooth opacity fade" },
                { id: "slide_up", label: "Slide Up", desc: "Slides from below" },
                { id: "slide_left", label: "Slide Left", desc: "Glides from right" },
                { id: "zoom", label: "Zoom In", desc: "Scales into view" },
                { id: "flip", label: "Flip Card", desc: "3D card flip reveal" },
                { id: "bounce", label: "Bounce", desc: "Bouncy entrance" },
                { id: "glow", label: "Glow Pulse", desc: "Purple glow pulse" },
                { id: "rotate", label: "Rotate In", desc: "Spins into place" },
                { id: "none", label: "No Animation", desc: "Static, instant" },
              ].map(anim => (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, card_animation: anim.id }))}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 transition-all text-left ${form.card_animation === anim.id ? "bg-purple-900/40 border-purple-500 shadow-lg shadow-purple-500/20" : "bg-gray-800 border-gray-700 hover:border-purple-500/50"}`}
                >
                  <Sparkles className="w-5 h-5 text-purple-300" />
                  <span className="text-white text-xs font-bold">{anim.label}</span>
                  <span className="text-gray-500 text-[10px]">{anim.desc}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-4">
              <div>
                <p className="text-white text-sm font-bold mb-2">Glow Design</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "radiant", label: "Radiant" },
                    { id: "lines", label: "Bar Lines" },
                    { id: "solid", label: "Solid Glow" },
                  ].map(style => (
                    <button key={style.id} type="button" onClick={() => setForm(f => ({ ...f, card_glow_style: style.id }))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border ${form.card_glow_style === style.id ? "bg-purple-900/40 border-purple-500 text-purple-200" : "bg-gray-800 border-gray-700 text-gray-400"}`}>
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-bold mb-2">Glow Color</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "red", label: "Red", className: "bg-red-500" },
                    { id: "purple", label: "Purple", className: "bg-purple-500" },
                    { id: "blue", label: "Blue", className: "bg-blue-500" },
                    { id: "green", label: "Green", className: "bg-green-500" },
                    { id: "gold", label: "Gold", className: "bg-yellow-400" },
                    { id: "multi", label: "Multi", className: "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400" },
                  ].map(color => (
                    <button key={color.id} type="button" onClick={() => setForm(f => ({ ...f, card_glow_color: color.id }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border ${form.card_glow_color === color.id ? "bg-gray-700 border-white/50 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}>
                      <span className={`w-3 h-3 rounded-full ${color.className}`} /> {color.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-bold mb-2">Custom Glow Color</p>
                <input type="color" value={form.card_glow_hex} onChange={e => setForm(f => ({ ...f, card_glow_hex: e.target.value, card_glow_color: "custom" }))}
                  className="w-full h-10 rounded-xl bg-gray-800 border border-gray-700 p-1" />
              </div>
              <div>
                <p className="text-white text-sm font-bold mb-2">Glow Speed</p>
                <div className="grid grid-cols-3 gap-2">
                  {["slow", "fast", "cycle"].map(speed => (
                    <button key={speed} type="button" onClick={() => setForm(f => ({ ...f, card_glow_speed: speed }))}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border capitalize ${form.card_glow_speed === speed ? "bg-purple-900/40 border-purple-500 text-purple-200" : "bg-gray-800 border-gray-700 text-gray-400"}`}>
                      {speed}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-bold mb-2">Listing Page Background Theme</p>
                <input type="color" value={form.listing_theme_color} onChange={e => setForm(f => ({ ...f, listing_theme_color: e.target.value }))}
                  className="w-full h-10 rounded-xl bg-gray-800 border border-gray-700 p-1" />
              </div>

              {/* Font customisation */}
              <div>
                <p className="text-white text-sm font-bold mb-2">Card Font Style</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "default", label: "Default", css: "inherit" },
                    { id: "mono", label: "Mono", css: "'Courier New', monospace" },
                    { id: "serif", label: "Serif", css: "Georgia, serif" },
                    { id: "rounded", label: "Rounded", css: "'Trebuchet MS', sans-serif" },
                    { id: "impact", label: "Impact", css: "Impact, sans-serif" },
                    { id: "condensed", label: "Condensed", css: "'Arial Narrow', sans-serif" },
                  ].map(f => (
                    <button key={f.id} type="button" onClick={() => setForm(prev => ({ ...prev, card_font_family: f.id }))}
                      style={{ fontFamily: f.css }}
                      className={`px-3 py-2 rounded-xl text-sm font-bold border ${form.card_font_family === f.id ? "bg-purple-900/40 border-purple-500 text-purple-200" : "bg-gray-800 border-gray-700 text-gray-400"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white text-sm font-bold mb-2">Font Letter Color</p>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.card_font_color} onChange={e => setForm(f => ({ ...f, card_font_color: e.target.value }))}
                    className="w-16 h-10 rounded-xl bg-gray-800 border border-gray-700 p-1" />
                  <span className="text-gray-400 text-xs">The title text color on your card.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Moderation result banner */}
          {moderationResult && (
            <div className="bg-yellow-900/30 border-2 border-yellow-500/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-300 flex-shrink-0" />
                <div>
                  <p className="text-yellow-300 font-black text-base">Listing Submitted for Admin Review</p>
                  <p className="text-yellow-200 text-sm mt-1">Your listing was flagged by our AI content system and is pending admin approval before it goes live.</p>
                  {moderationResult.aiAnalysis?.reason && (
                    <p className="text-yellow-400 text-xs mt-2">Reason: {moderationResult.aiAnalysis.reason}</p>
                  )}
                  {moderationResult.flaggedKeywords?.length > 0 && (
                    <p className="text-yellow-500 text-xs mt-1">Flagged terms: {moderationResult.flaggedKeywords.join(", ")}</p>
                  )}
                </div>
              </div>
              <a href="/dashboard?tab=listings" className="block w-full text-center py-3 rounded-xl bg-yellow-600/30 border border-yellow-600/50 text-yellow-300 font-bold text-sm hover:bg-yellow-600/50 transition-colors">
                Go to My Listings
              </a>
            </div>
          )}

          {!moderationResult && (
            <button type="submit" disabled={saving}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
              {saving ? "Checking content & saving..." : editId ? "Update Listing" : form.category === "games" ? "Add a Game" : form.category === "premium_mods" ? "Sell a Premium Mod" : "Post"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
