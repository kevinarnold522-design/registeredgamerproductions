import React, { useState, useEffect, useRef } from "react";
import { Upload, Plus, ArrowLeft, Play, Youtube, ExternalLink, Monitor, Gamepad2, CheckCircle, Info, Laptop, Boxes, Megaphone, Wrench, Coffee, Sparkles, AlertTriangle, DollarSign, Save, FolderOpen, Tag, LayoutGrid } from "lucide-react";

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
import ImageSortableList from "@/components/ImageSortableList";
import SearchableSelect from "@/components/listings/SearchableSelect";
import BrandLogo from "@/components/shared/BrandLogo";
import DownloadHostBadge, { DOWNLOAD_HOST_OPTIONS } from "@/components/shared/DownloadHostBadge";
import { uploadFileWithFallback } from "@/lib/uploadToR2";
import { TOP_FRANCHISES } from "@/lib/franchises";
import { supabase } from "@/lib/supabaseClient";
import { useLocation, useNavigate } from "react-router-dom";
import { normalizeCategoryId } from "@/lib/categoryMatching";

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function parseCommaList(value = "") {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildTitleMetadata(title = "") {
  const cleanTitle = title.trim();
  if (!cleanTitle) return [];
  const parts = cleanTitle
    .split(/[\s\-_/|,]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3);
  return Array.from(new Set([cleanTitle, ...parts])).slice(0, 8);
}

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const MAX_UPLOAD_LABEL = "25MB";
const LISTING_ORPHAN_CLEANUP_KEY = "listing-orphan-cleanup-at";
const LISTING_ORPHAN_CLEANUP_INTERVAL = 12 * 60 * 60 * 1000;

function buildInitialForm(defaultCat = "", defaultSub = "", defaultGame = "") {
  return {
    title: "",
    description: "",
    price: "0",
    currency: "USD",
    product_type: "digital",
    category: defaultCat,
    subcategories: defaultSub ? [defaultSub] : [],
    newsfeed_categories: [],
    digital_subcategory: "",
    digital_subcategory_custom: "",
    physical_subcategory: "",
    condition: "digital",
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
  };
}

function buildFormFromListing(listing = {}, defaultCat = "", defaultSub = "", defaultGame = "") {
  const base = buildInitialForm(defaultCat, defaultSub, defaultGame);
  return {
    ...base,
    title: listing.title ?? base.title,
    description: listing.description ?? base.description,
    price: listing.price !== undefined && listing.price !== null ? String(listing.price) : base.price,
    currency: listing.currency === "PHP" ? "USD" : (listing.currency ?? base.currency),
    product_type: listing.product_type ?? base.product_type,
    category: listing.category ?? base.category,
    subcategories: Array.isArray(listing.subcategories) ? listing.subcategories : base.subcategories,
    newsfeed_categories: Array.isArray(listing.newsfeed_categories) ? listing.newsfeed_categories : base.newsfeed_categories,
    digital_subcategory: listing.digital_subcategory ?? base.digital_subcategory,
    digital_subcategory_custom: listing.digital_subcategory_custom ?? base.digital_subcategory_custom,
    physical_subcategory: listing.physical_subcategory ?? base.physical_subcategory,
    condition: listing.condition ?? base.condition,
    is_premium: listing.is_premium ?? base.is_premium,
    platforms: Array.isArray(listing.platforms) ? listing.platforms : base.platforms,
    quantity: listing.quantity ?? base.quantity,
    location: listing.location ?? base.location,
    tags: Array.isArray(listing.tags) ? listing.tags.join(", ") : (listing.tags ?? base.tags),
    keywords: Array.isArray(listing.keywords) ? listing.keywords.join(", ") : (listing.keywords ?? base.keywords),
    youtube_url: listing.youtube_url ?? base.youtube_url,
    video_url: listing.video_url ?? base.video_url,
    game_name: listing.game_name ?? base.game_name,
    game_platform: listing.game_platform ?? base.game_platform,
    paypal_email: listing.paypal_email ?? base.paypal_email,
    external_link: listing.external_link ?? base.external_link,
    download_url: listing.download_url ?? base.download_url,
    download_host: listing.download_host ?? base.download_host,
    card_animation: listing.card_animation ?? base.card_animation,
    card_glow_style: listing.card_glow_style ?? base.card_glow_style,
    card_glow_color: listing.card_glow_color ?? base.card_glow_color,
    card_glow_hex: listing.card_glow_hex ?? base.card_glow_hex,
    card_glow_speed: listing.card_glow_speed ?? base.card_glow_speed,
    listing_theme_color: listing.listing_theme_color ?? base.listing_theme_color,
    card_font_family: listing.card_font_family ?? base.card_font_family,
    card_font_color: listing.card_font_color ?? base.card_font_color,
    kofi_url: listing.kofi_url ?? base.kofi_url,
    buymeacoffee_url: listing.buymeacoffee_url ?? base.buymeacoffee_url,
    patreon_url: listing.patreon_url ?? base.patreon_url,
    community_franchise_id: listing.community_franchise_id ?? base.community_franchise_id,
    modding_subcategory: listing.modding_subcategory ?? base.modding_subcategory,
    cross_post_gaming: listing.cross_post_gaming ?? base.cross_post_gaming,
    cross_post_modding: listing.cross_post_modding ?? base.cross_post_modding,
    bulk_cross_post_ids: Array.isArray(listing.bulk_cross_post_ids) ? listing.bulk_cross_post_ids : base.bulk_cross_post_ids,
    ign_rating: listing.ign_rating != null ? String(listing.ign_rating) : base.ign_rating,
    store_platforms: Array.isArray(listing.store_platforms) ? listing.store_platforms : base.store_platforms,
    tool_target_game: listing.tool_target_game ?? base.tool_target_game,
    preview_video_url: listing.preview_video_url ?? base.preview_video_url,
  };
}

export default function CreateListing() {
  const { user: authUser, isLoadingAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);
  const downloadFileRef = useRef(null);
  const pendingUploadsRef = useRef([]);
  const listingSavedRef = useRef(false);
  const cleanupQueuedRef = useRef(false);
  const accessTokenRef = useRef("");

  const params = new URLSearchParams(location.search);
  const editId = params.get("edit");
  const defaultCat = normalizeCategoryId(params.get("cat") || "");
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
  ];
  const COMBINED_AVAILABLE_OPTIONS = [
    ...PLATFORMS.map(p => ({ id: p.id, label: p.id, type: "platform", brand: p.brand })),
    ...GAMES_STORES.map(s => ({ id: s.id, label: s.label, type: "store", color: s.color, iconText: s.iconText, brand: s.id })),
  ].filter((option, index, arr) => arr.findIndex((item) => item.label.toLowerCase() === option.label.toLowerCase()) === index);
  const [form, setForm] = useState(() => buildInitialForm(defaultCat, defaultSub, defaultGame));
  const autoMetaRef = useRef({ tags: "", keywords: "" });

  useEffect(() => {
    // Close game dropdown on outside click
    const handler = (e) => {
      if (gameDropdownRef.current && !gameDropdownRef.current.contains(e.target)) setShowGameDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const autoMeta = buildTitleMetadata(form.title).join(", ");
    setForm((prev) => {
      const next = {};
      if (!prev.tags || prev.tags === autoMetaRef.current.tags) next.tags = autoMeta;
      if (!prev.keywords || prev.keywords === autoMetaRef.current.keywords) next.keywords = autoMeta;
      if (!Object.keys(next).length) return prev;
      return { ...prev, ...next };
    });
    autoMetaRef.current = { tags: autoMeta, keywords: autoMeta };
  }, [form.title]);

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
          setForm(buildFormFromListing(l, defaultCat, defaultSub, defaultGame));
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
    await cleanupListingUploads([pendingUpload || { file_url: removedUrl }]).catch(() => {});
  };

  const removeUploadedField = async (field) => {
    const url = form[field];
    setForm((prev) => ({ ...prev, [field]: "" }));
    const pendingUpload = findPendingUploadByUrl(url);
    await cleanupListingUploads([pendingUpload || { file_url: url }]).catch(() => {});
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
  // Saved listing templates/filters should be scoped per account so switching
  // users on the same device doesn't leak templates between accounts.
  const savedFiltersKey = `listing_saved_filters:${(user?.email || "anonymous").toLowerCase()}`;
  const [savedFilters, setSavedFilters] = useState(() => {
    try { return JSON.parse(localStorage.getItem(savedFiltersKey) || "[]"); } catch { return []; }
  });
  const [filterName, setFilterName] = useState("");
  const [showSaveFilter, setShowSaveFilter] = useState(false);
  const [showLoadFilter, setShowLoadFilter] = useState(false);

  useEffect(() => {
    try { setSavedFilters(JSON.parse(localStorage.getItem(savedFiltersKey) || "[]")); } catch { setSavedFilters([]); }
  }, [savedFiltersKey]);

  const persistTemplate = (name) => {
    if (!name.trim()) return;
    const filterData = {
      name: name.trim(),
      data: {
        product_type: form.product_type,
        category: form.category,
        subcategories: form.subcategories,
        newsfeed_categories: form.newsfeed_categories,
        digital_subcategory: form.digital_subcategory,
        digital_subcategory_custom: form.digital_subcategory_custom,
        physical_subcategory: form.physical_subcategory,
        condition: form.condition,
        is_premium: form.is_premium,
        platforms: form.platforms,
        store_platforms: form.store_platforms,
        game_platform: form.game_platform,
        game_name: form.game_name,
        quantity: form.quantity,
        location: form.location,
        description: form.description,
        tags: form.tags,
        keywords: form.keywords,
        card_glow_style: form.card_glow_style,
        card_glow_color: form.card_glow_color,
        card_glow_hex: form.card_glow_hex,
        card_glow_speed: form.card_glow_speed,
        listing_theme_color: form.listing_theme_color,
        card_font_family: form.card_font_family,
        card_font_color: form.card_font_color,
        community_franchise_id: form.community_franchise_id,
        modding_subcategory: form.modding_subcategory,
        bulk_cross_post_ids: form.bulk_cross_post_ids,
        ign_rating: form.ign_rating,
        tool_target_game: form.tool_target_game,
        youtube_url: form.youtube_url,
        preview_video_url: form.preview_video_url,
        download_host: form.download_host,
      }
    };
    const updated = [...savedFilters.filter(f => f.name !== name.trim()), filterData];
    setSavedFilters(updated);
    localStorage.setItem(savedFiltersKey, JSON.stringify(updated));
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    persistTemplate(filterName);
    setFilterName("");
    setShowSaveFilter(false);
  };

  const handleLoadFilter = (filter) => {
    setForm(f => ({
      ...f,
      ...filter.data,
      title: f.title,
      external_link: "",
      download_url: "",
      kofi_url: "",
      buymeacoffee_url: "",
      patreon_url: "",
    }));
    if (filter.data?.game_name) setGameSearch(filter.data.game_name);
    setShowLoadFilter(false);
  };

  const handleDeleteFilter = (name) => {
    const updated = savedFilters.filter(f => f.name !== name);
    setSavedFilters(updated);
    localStorage.setItem(savedFiltersKey, JSON.stringify(updated));
  };

  const handleCategoryChange = (val) => {
    setForm((prev) => ({
      ...prev,
      category: val,
      subcategories: [],
      newsfeed_categories: [],
      bulk_cross_post_ids: val === "games" ? [] : prev.bulk_cross_post_ids,
      community_franchise_id: val === "games" ? "" : prev.community_franchise_id,
      modding_subcategory: val === "games" ? "" : prev.modding_subcategory,
      ign_rating: val === "games" ? prev.ign_rating : "",
      tool_target_game: val === "paid_tools" || val === "premium_mods" ? prev.tool_target_game : "",
      is_premium: val === "premium_mods" ? true : prev.is_premium,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModerationResult(null);

    try {
    if (!form.category) throw new Error("Please select a main category.");
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
    const isPaidMod = priceVal > 0 && (form.category === "modding" || form.category === "premium_mods");
    const effectiveCategory = isPaidMod ? "premium_mods" : form.category;
    const autoMeta = buildTitleMetadata(form.title);
    const mergedTags = Array.from(new Set([...autoMeta, ...parseCommaList(form.tags)]));
    const mergedKeywords = Array.from(new Set([...autoMeta, ...parseCommaList(form.keywords)]));
    const existingListing = editId ? await base44.entities.Listing.get(editId) : null;
    const sellerEmail = existingListing?.seller_email || user.email;
    const sellerName = existingListing?.seller_username || profile?.username || profile?.display_name || sellerEmail?.split("@")[0] || "Gamer";
    const data = {
      ...form,
      category: effectiveCategory,
      digital_subcategory: form.digital_subcategory_custom?.trim() || form.digital_subcategory,
      digital_subcategory_custom: undefined,
      price: priceVal,
      currency: form.currency === "PHP" ? "USD" : (form.currency || "USD"),
      is_free: priceVal === 0,
      // All paid mods are automatically Premium
      is_premium: form.is_premium || isPaidMod,
      // Every listing is treated as digital content
      product_type: form.product_type || "digital",
      // Donation links only apply to paid listings — clear them on free ones
      kofi_url: priceVal > 0 ? form.kofi_url : "",
      buymeacoffee_url: priceVal > 0 ? form.buymeacoffee_url : "",
      patreon_url: priceVal > 0 ? form.patreon_url : "",
      stock: parseInt(form.quantity) || 1,
      quantity: parseInt(form.quantity) || 1,
      tags: mergedTags,
      keywords: mergedKeywords,
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
      newsfeed_categories: Array.from(new Set([
        ...(form.newsfeed_categories || []),
        ...(isPaidMod ? ["premium_mods", "store", "buy_sell"] : []),
      ])),
      modding_subcategory: form.modding_subcategory || undefined,
      subcategory: undefined,
      platform: undefined,
      ign_rating: form.ign_rating !== "" ? parseFloat(form.ign_rating) : undefined,
      store_platforms: form.store_platforms || [],
      tool_target_game: (effectiveCategory === "paid_tools" || effectiveCategory === "premium_mods") ? (form.tool_target_game || form.game_name || undefined) : undefined,
      preview_video_url: form.preview_video_url || undefined,
      is_approved: mod?.is_approved !== false,
      status: mod?.requiresReview ? "pending" : "active",
    };

    if (effectiveCategory === "games") {
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
      if (!editId && typeof window !== "undefined" && window.confirm("Do you want to save this listing setup as a template for your next post?")) {
        const templateName = window.prompt("Template name", `${form.category || "listing"} template`);
        if (templateName?.trim()) persistTemplate(templateName);
      }
      navigate(`/listing?id=${savedListing.id}`);
    } else {
      navigate("/dashboard?tab=listings");
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
  const primarySubcategory = form.subcategories?.[0] || "";
  const additionalSubcategories = form.subcategories?.slice(1) || [];
  const availableAdditionalSubcategories = (selectedCat?.subcategories || []).filter((item) => item !== primarySubcategory);

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
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-white font-bold flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-cyan-300" /> Listing Templates
                </h3>
                <p className="text-gray-500 text-xs mt-1">Load a saved template before filling out the rest of the listing.</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {savedFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowLoadFilter((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/50 transition-colors"
                  >
                    <FolderOpen className="w-3 h-3" /> Load Template ({savedFilters.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowSaveFilter((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-bold hover:bg-purple-900/50 transition-colors"
                >
                  <Save className="w-3 h-3" /> Save Template
                </button>
              </div>
            </div>

            {showSaveFilter && (
              <div className="p-4 bg-gray-800 rounded-2xl border border-purple-700/50">
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Save className="w-4 h-4 text-purple-300" /> Save Current Settings as Template</p>
                <p className="text-gray-500 text-xs mb-3">Saves your categories, SEO tags, platforms, styling, and placement settings.</p>
                <div className="flex gap-2">
                  <input value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="Template name (e.g. Football Life Mods)"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500" />
                  <button type="button" onClick={handleSaveFilter} disabled={!filterName.trim()}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-purple-700 transition-colors">Save</button>
                  <button type="button" onClick={() => setShowSaveFilter(false)}
                    className="px-4 py-2 rounded-xl bg-gray-900 text-gray-400 text-sm hover:bg-gray-700 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {showLoadFilter && (
              <div className="p-4 bg-gray-800 rounded-2xl border border-cyan-700/40">
                <p className="text-white font-bold text-sm mb-3 flex items-center gap-2"><FolderOpen className="w-4 h-4 text-cyan-300" /> Load Saved Template</p>
                <div className="space-y-2">
                  {savedFilters.map(f => (
                    <div key={f.name} className="flex items-center justify-between p-3 bg-gray-900 rounded-xl">
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
          </div>

          <div className="bg-gradient-to-br from-purple-900/25 to-pink-900/15 rounded-2xl border border-purple-700/40 p-6 space-y-5">
            <div>
              <h3 className="text-white font-black text-lg">Listing basics</h3>
              <p className="text-gray-400 text-sm mt-1">Start with the essentials. Extra placement options stay hidden until you choose a category.</p>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                placeholder="What are you listing?"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
              />
            </div>

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

            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={5}
                placeholder="Describe what is included, game version, install steps, and anything buyers should know..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Digital product type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, product_type: "digital", condition: "digital" })}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${form.product_type === "digital" ? "bg-purple-900/40 border-purple-500 shadow-lg shadow-purple-500/20" : "bg-gray-800 border-gray-700 hover:border-purple-500/50"}`}
                >
                  <Laptop className="w-9 h-9 text-purple-300" />
                  <span className="text-white font-bold text-sm">Digital product</span>
                  <span className="text-gray-400 text-xs text-center">Default for mods, tools, guides, files, and downloads</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, product_type: "physical", condition: "new" })}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${form.product_type === "physical" ? "bg-pink-900/40 border-pink-500 shadow-lg shadow-pink-500/20" : "bg-gray-800 border-gray-700 hover:border-pink-500/50"}`}
                >
                  <Gamepad2 className="w-9 h-9 text-pink-300" />
                  <span className="text-white font-bold text-sm">Physical product</span>
                  <span className="text-gray-400 text-xs text-center">Consoles, accessories, controllers, and merchandise</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Pricing</label>
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, price: "0" })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${form.price === "0" || form.price === 0 ? "bg-green-900/40 border-2 border-green-500/70 text-green-400" : "bg-gray-800 border border-gray-700 text-gray-400"}`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, price: f.price === "0" || f.price === 0 ? "" : f.price }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${form.price !== "0" && form.price !== 0 && form.price !== "" ? "bg-purple-900/40 border-2 border-purple-500/70 text-purple-400" : "bg-gray-800 border border-gray-700 text-gray-400"}`}
                >
                  <DollarSign className="w-4 h-4 inline mr-1" /> Set Price
                </button>
              </div>

              {(form.price !== "0" && form.price !== 0) && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={form.currency === "PHP" ? "USD" : (form.currency || "USD")}
                      onChange={e => setForm({ ...form, currency: e.target.value })}
                      className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                    >
                      {CURRENCY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>)}
                    </select>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      required
                      min="1"
                      placeholder={`Enter price in ${getCurrencySymbol(form.currency === "PHP" ? "USD" : (form.currency || "USD"))}`}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>

                  <div className="rounded-2xl border border-orange-700/40 bg-gradient-to-br from-orange-900/15 to-yellow-900/10 p-4 space-y-3">
                    <h4 className="text-orange-200 font-bold flex items-center gap-2 text-sm">
                      <Coffee className="w-4 h-4 text-orange-300" /> Support links for paid listings
                    </h4>
                    <div className="rounded-lg border border-orange-400/30 bg-orange-500/10 px-3 py-2 text-orange-200 text-[11px] leading-snug flex items-start gap-2" data-testid="donation-routing-message">
                      <Info className="w-3.5 h-3.5 text-orange-300 mt-0.5 flex-shrink-0" />
                      <span>These links only show when the listing has a paid price.</span>
                    </div>
                    <div>
                      <label className="text-gray-300 text-[11px] font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                        <Coffee className="w-3 h-3 text-orange-400" /> Ko-fi URL
                      </label>
                      <input value={form.kofi_url} onChange={e => setForm({ ...form, kofi_url: e.target.value })} placeholder="https://ko-fi.com/yourname" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-300 text-[11px] font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                        <Coffee className="w-3 h-3 text-yellow-400" /> Buy Me a Coffee URL
                      </label>
                      <input value={form.buymeacoffee_url} onChange={e => setForm({ ...form, buymeacoffee_url: e.target.value })} placeholder="https://buymeacoffee.com/yourname" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 text-sm" />
                    </div>
                    <div>
                      <label className="text-gray-300 text-[11px] font-semibold uppercase tracking-wider mb-1.5 block flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3 text-red-400" /> Patreon URL
                      </label>
                      <input value={form.patreon_url} onChange={e => setForm({ ...form, patreon_url: e.target.value })} placeholder="https://patreon.com/yourname" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

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

            {/* Universal preview media */}
            <div className="pt-2 border-t border-gray-800">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Play className="w-3 h-3 text-purple-400" /> Product Preview Media (optional)</label>
              <p className="text-gray-500 text-xs mb-2">Paste a YouTube link for a preview shown across the platform.</p>
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

            {/* Download link */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Download Link</label>
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
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Choose Download Host</label>
              <div className="grid grid-cols-2 gap-2">
                {DOWNLOAD_HOST_OPTIONS.map(h => (
                  <button key={h.id} type="button"
                    onClick={() => setForm(f => ({ ...f, download_host: f.download_host === h.id ? "" : h.id }))}
                    className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl border-2 text-sm font-bold transition-all min-h-[74px] ${form.download_host === h.id ? "border-opacity-100 text-white" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500"}`}
                    style={form.download_host === h.id ? { borderColor: h.color, background: `${h.color}22`, color: h.color } : {}}>
                    <DownloadHostBadge host={h.id} size="md" showLabel={false} />
                    <span className="text-[10px] font-bold leading-none">{h.label}</span>
                    {form.download_host === h.id && <CheckCircle className="w-3 h-3" />}
                  </button>
                ))}
              </div>
              {form.download_host && <p className="text-green-400 text-xs mt-2 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> {DOWNLOAD_HOST_OPTIONS.find(h => h.id === form.download_host)?.label} logo will display on your listing everywhere</p>}
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Game, platform, and stock</h3>
            <p className="text-gray-500 text-xs">Only the extra listing details live here. The basic title, description, product type, and pricing stay at the top.</p>

            {form.category === "games" && (
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
                <label className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Gamepad2 className="w-3 h-3" /> Game Platform Text
                </label>
                <p className="text-gray-500 text-xs mb-2">Manually add platform notes shown on the game listing, like PC, PS5, Android, or Switch.</p>
                <input value={form.game_platform} onChange={e => setForm({ ...form, game_platform: e.target.value })}
                  placeholder="e.g. PC / PS5 / Android / Switch"
                  className="w-full bg-gray-800 border border-blue-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm" />
              </div>
            )}

            {/* Combined Platform + Store Multi-Select */}
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Monitor className="w-3 h-3 text-purple-400" /> Available On & Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {COMBINED_AVAILABLE_OPTIONS.map(option => {
                  const isSteamOption = option.type === "store" && option.id === "steam";
                  const selected = isSteamOption
                    ? (form.store_platforms || []).includes("steam") || (form.platforms || []).includes("Steam")
                    : option.type === "platform"
                      ? (form.platforms || []).includes(option.id)
                      : (form.store_platforms || []).includes(option.id);
                  return (
                    <button key={`${option.type}-${option.id}`} type="button"
                      onClick={() => setForm(f => {
                        if (isSteamOption) {
                          return {
                            ...f,
                            platforms: (f.platforms || []).filter(x => x !== "Steam"),
                            store_platforms: selected ? (f.store_platforms || []).filter(x => x !== "steam") : [...(f.store_platforms || []), "steam"],
                          };
                        }
                        return option.type === "platform"
                          ? { ...f, platforms: selected ? (f.platforms || []).filter(x => x !== option.id) : [...(f.platforms || []), option.id] }
                          : { ...f, store_platforms: selected ? (f.store_platforms || []).filter(x => x !== option.id) : [...(f.store_platforms || []), option.id] };
                      })}
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
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Quantity</label>
              <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} min={1}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
            </div>
          </div>

          {/* Category & Subcategories */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Category, subcategories, and placement</h3>
            <div>
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Main Category *</label>
              <SearchableSelect
                value={form.category}
                onChange={handleCategoryChange}
                options={dynamicCategories.map(c => ({ value: c.id, label: c.label }))}
                placeholder="Select a category first"
              />
            </div>

            {!form.category ? (
              <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900/50 px-4 py-4 text-gray-400 text-sm">
                Pick a main category first. Then the matching subcategories, newsfeed targets, and bulk posting options will appear below.
              </div>
            ) : (
              <>
                {form.category === "games" && (
                  <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-4 space-y-4">
                    <div>
                      <label className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> IGN Rating (out of 10)</label>
                      <input type="number" step="0.1" min="0" max="10" value={form.ign_rating} onChange={e => setForm({ ...form, ign_rating: e.target.value })} placeholder="e.g. 9.5" className="w-full bg-gray-800 border border-emerald-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 text-sm" />
                    </div>
                    {!isAdmin(user?.email) && !editId && (
                      <p className="text-yellow-400/80 text-xs flex items-center gap-1.5"><Info className="w-3 h-3" /> Game submissions require admin approval before going live.</p>
                    )}
                  </div>
                )}

                {form.category === "paid_tools" && (
                  <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
                    <label className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Wrench className="w-3 h-3" /> What game is this tool for?</label>
                    <input value={form.tool_target_game} onChange={e => setForm({ ...form, tool_target_game: e.target.value })} placeholder="e.g. NBA 2K26, Football Life, GTA V, Valorant" className="w-full bg-gray-800 border border-blue-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm" />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {form.product_type === "digital" && (
                    <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4">
                      <label className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-purple-300" /> Digital Product Subcategory
                      </label>
                      <select value={form.digital_subcategory} onChange={e => setForm({ ...form, digital_subcategory: e.target.value })} className="w-full bg-gray-800 border border-purple-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
                        <option value="">Select digital subcategory</option>
                        {DIGITAL_SUBCATEGORIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                      <input value={form.digital_subcategory_custom || ""} onChange={e => setForm({ ...form, digital_subcategory_custom: e.target.value })} placeholder="Optional custom digital subcategory" className="w-full mt-3 bg-gray-800 border border-purple-700/40 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 text-sm" />
                    </div>
                  )}

                  {form.product_type === "physical" && (
                    <div className="bg-pink-900/20 border border-pink-700/40 rounded-xl p-4">
                      <label className="text-pink-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <Boxes className="w-3 h-3 text-pink-300" /> Physical Product Subcategory
                      </label>
                      <select value={form.physical_subcategory} onChange={e => setForm({ ...form, physical_subcategory: e.target.value })} className="w-full bg-gray-800 border border-pink-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 text-sm">
                        <option value="">Select physical subcategory</option>
                        {PHYSICAL_SUBCATEGORIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                    <label className="text-gray-300 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Primary Subcategory</label>
                    <select
                      value={primarySubcategory}
                      onChange={e => setForm(f => ({
                        ...f,
                        subcategories: e.target.value
                          ? [e.target.value, ...(f.subcategories?.slice(1) || []).filter(x => x !== e.target.value).slice(0, 2)]
                          : (f.subcategories?.slice(1) || []),
                      }))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
                    >
                      <option value="">Select primary subcategory</option>
                      {form.category === "games" ? (
                        <>
                          <option value="Games">Games</option>
                          <option value="How To / Guides">How To / Guides</option>
                        </>
                      ) : (
                        (selectedCat?.subcategories || []).map(s => <option key={s} value={s}>{s}</option>)
                      )}
                    </select>
                  </div>
                </div>

                {form.category !== "games" && form.category !== "premium_mods" && availableAdditionalSubcategories.length > 0 && (
                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Additional Subcategories</label>
                    <p className="text-gray-500 text-xs mb-3">Hidden until a main category is chosen. Add up to 2 extra subcategories.</p>
                    <div className="flex flex-wrap gap-2">
                      {availableAdditionalSubcategories.map((s) => {
                        const isSelected = additionalSubcategories.includes(s);
                        const atMax = additionalSubcategories.length >= 2 && !isSelected;
                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={atMax}
                            onClick={() => setForm(f => {
                              const first = f.subcategories?.[0];
                              const rest = f.subcategories?.slice(1) || [];
                              const nextRest = isSelected ? rest.filter(x => x !== s) : [...rest, s].slice(0, 2);
                              return { ...f, subcategories: first ? [first, ...nextRest] : nextRest };
                            })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isSelected ? "bg-purple-600 text-white" : atMax ? "bg-gray-800/40 text-gray-600 cursor-not-allowed" : "bg-gray-800 text-gray-400 hover:bg-purple-900/30"}`}
                          >
                            {s} {isSelected && <CheckCircle className="w-3 h-3 inline ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {form.category !== "games" && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-cyan-900/20 border border-cyan-500/60 rounded-xl p-4">
                      <label className="text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <Gamepad2 className="w-3 h-3 text-cyan-300" /> Gaming Community
                      </label>
                      <SearchableSelect
                        value={form.community_franchise_id}
                        onChange={(val) => setForm({ ...form, community_franchise_id: val })}
                        options={TOP_FRANCHISES.map(f => ({ value: f.id, label: `${f.name} (${f.genre})` }))}
                        placeholder="Select one main gaming community"
                        borderClass="border-cyan-500/70 focus-within:border-cyan-400"
                      />
                    </div>

                    <div className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl p-4">
                      <label className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <LayoutGrid className="w-3 h-3 text-indigo-300" /> Show in Newsfeeds
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {NEWSFEED_TARGETS.map(t => {
                          const sel = (form.newsfeed_categories || []).includes(t.id);
                          return (
                            <button key={t.id} type="button" onClick={() => setForm(f => ({ ...f, newsfeed_categories: sel ? (f.newsfeed_categories || []).filter(x => x !== t.id) : [...(f.newsfeed_categories || []), t.id] }))} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${sel ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-indigo-900/30"}`}>
                              {t.label} {sel && <CheckCircle className="w-3 h-3 inline ml-1" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-purple-900/20 border border-purple-500/60 rounded-xl p-4 md:col-span-2">
                      <label className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <Megaphone className="w-3 h-3 text-purple-300" /> Bulk Cross-Posting
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {TOP_FRANCHISES.filter(f => f.id !== form.community_franchise_id).map(franchise => {
                          const selected = form.bulk_cross_post_ids.includes(franchise.id);
                          return (
                            <button
                              key={franchise.id}
                              type="button"
                              onClick={() => setForm(f => ({
                                ...f,
                                bulk_cross_post_ids: selected ? f.bulk_cross_post_ids.filter(id => id !== franchise.id) : [...f.bulk_cross_post_ids, franchise.id]
                              }))}
                              className={`px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all text-left ${selected ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-purple-900/30"}`}
                            >
                              {franchise.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {!["modding", "premium_mods"].includes(form.category) && (
                    <div className="bg-orange-900/20 border border-orange-700/40 rounded-xl p-4 md:col-span-2">
                      <label className="text-orange-300 text-xs font-semibold uppercase tracking-wider mb-2 block flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-orange-300" /> Modding Community Subcategory
                      </label>
                      <select value={form.modding_subcategory} onChange={e => setForm({ ...form, modding_subcategory: e.target.value })} className="w-full bg-gray-800 border border-orange-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm">
                        <option value="">Not a mod listing</option>
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
                        <option value="PC">PC Mods & Trainers</option>
                      </select>
                    </div>
                    )}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Condition</label>
                    <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm">
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

                  <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-gray-800 bg-gray-800/60 px-4 py-3">
                    <input type="checkbox" checked={form.is_premium} onChange={e => setForm({ ...form, is_premium: e.target.checked })} className="w-4 h-4 rounded accent-purple-600" />
                    <span className="text-gray-300 text-sm font-medium">Mark as Premium listing</span>
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Tags</label>
                    <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Auto-filled from title, edit if needed" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Tag className="w-3 h-3" /> SEO Keywords</label>
                    <input value={form.keywords} onChange={e => setForm({ ...form, keywords: e.target.value })} placeholder="Auto-filled from title, edit if needed" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm" />
                    <p className="text-gray-600 text-xs mt-1">Listing title keywords are added automatically for SEO and search tags.</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Support / Donation Links moved up under the Pricing block for paid listings. */}

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

          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-white font-bold flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-cyan-300" /> Listing Templates
                </h3>
                <p className="text-gray-500 text-xs mt-1">Save your current setup and reuse it later. Templates skip the title, download links, and support links when loaded.</p>
              </div>
              <div className="flex gap-2">
                {savedFilters.length > 0 && (
                  <button type="button" onClick={() => setShowLoadFilter(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 text-xs font-bold hover:bg-cyan-900/50 transition-colors">
                    <FolderOpen className="w-3 h-3" /> Load Template ({savedFilters.length})
                  </button>
                )}
                <button type="button" onClick={() => setShowSaveFilter(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-bold hover:bg-purple-900/50 transition-colors">
                  <Save className="w-3 h-3" /> Save Template
                </button>
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
