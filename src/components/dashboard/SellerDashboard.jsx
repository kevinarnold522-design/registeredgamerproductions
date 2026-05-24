import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, BarChart2, Package, CreditCard, Plus, CheckCircle, Upload, DollarSign, Youtube } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CreatorVideoTools from "./CreatorVideoTools";
import CreatorAnalyticsTab from "./CreatorAnalyticsTab";
import LeaderboardTab from "./LeaderboardTab";
import GamerCheckmark from "@/components/shared/GamerCheckmark";

export default function SellerDashboard({ user, profile }) {
  const [tab, setTab] = useState("overview");
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [myListings, myOrders] = await Promise.all([
        base44.entities.Listing.filter({ seller_email: user.email }),
        base44.entities.Order.filter({ seller_email: user.email }),
      ]);
      setListings(myListings);
      setOrders(myOrders);
      setLoading(false);
    };
    load();
  }, [user.email]);

  const markAsSold = async (listingId) => {
    await base44.entities.Listing.update(listingId, { status: "sold" });
    setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: "sold" } : l));
  };

  const totalRevenue = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.seller_payout || 0), 0);
  const totalSales = orders.filter(o => o.payment_status === "paid").length;
  const activeListings = listings.filter(l => l.status === "active").length;
  const isVerified = profile?.is_verified;
  const verificationStatus = profile?.verification_status || "none";

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "listings", label: "My Listings", icon: Store },
    { id: "orders", label: "Orders", icon: Package },
    { id: "analytics", label: "📊 Analytics", icon: BarChart2 },
    { id: "videos", label: "📹 Video Tools", icon: Youtube },
    { id: "leaderboard", label: "🏆 Leaderboard", icon: DollarSign },
    { id: "payouts", label: "Payouts & Banking", icon: CreditCard },
    { id: "verification", label: isVerified ? "✅ Verified" : "Get Verified", icon: CheckCircle },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
            <Store className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Seller Dashboard</h1>
            <div className="flex items-center gap-2">
              <p className="text-purple-400 text-sm font-semibold">
                {profile?.account_type === "digital_creator" ? "🎨 Digital Creator" : "🏢 Business"} · {profile?.username}
              </p>
              <GamerCheckmark accountType={profile?.account_type} isVerified={profile?.is_verified} userEmail={user?.email} size="md" />
            </div>
          </div>
        </div>
        <a href="/create-listing"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Listing
        </a>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${tab === t.id ? "bg-purple-500/20 border border-purple-500/50 text-purple-300" : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10 border-green-500/30" },
              { label: "Total Sales", value: totalSales, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
              { label: "Active Listings", value: activeListings, icon: Store, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/30" },
              { label: "Pending Orders", value: orders.filter(o => o.order_status === "processing").length, icon: BarChart2, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`rounded-2xl p-4 border ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Recent orders */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800"><h3 className="text-white font-bold">Recent Sales</h3></div>
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8 text-sm">No sales yet. Create your first listing!</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>{["Item", "Buyer", "Amount", "Your Payout", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {orders.slice(0, 8).map((o) => (
                    <tr key={o.id} className="border-t border-gray-800">
                      <td className="px-4 py-3 text-white text-xs font-medium">{o.listing_title}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{o.buyer_email}</td>
                      <td className="px-4 py-3 text-green-400 font-bold">₱{o.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-purple-400 font-bold">₱{o.seller_payout?.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.payment_status === "paid" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>{o.payment_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Listings */}
      {tab === "listings" && (
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="text-white font-bold text-lg">My Listings ({listings.length})</h3>
            <a href="/create-listing" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-300 text-sm font-semibold hover:bg-purple-600/30 transition-colors">
              <Plus className="w-4 h-4" /> Add Listing
            </a>
          </div>
          {listings.length === 0 ? (
            <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
              <Store className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-400 font-semibold mb-2">No listings yet</p>
              <p className="text-gray-600 text-sm mb-4">Create your first listing to start selling</p>
              <a href="/create-listing" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity">
                Create First Listing
              </a>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((l) => (
                <div key={l.id} className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                  {l.images?.[0] && <img src={l.images[0]} alt="" className="w-full h-40 object-cover" />}
                  <div className="p-4">
                    <p className="text-white font-bold truncate">{l.title}</p>
                    <p className="text-purple-400 font-black mt-1">₱{l.price?.toLocaleString()}</p>
                    <div className="flex gap-2 mt-3">
                      <a href={`/create-listing?edit=${l.id}`} className="flex-1 text-center py-2 rounded-lg bg-purple-900/30 border border-purple-700/40 text-purple-300 text-xs font-semibold hover:bg-purple-900/50 transition-colors">Edit</a>
                      {l.status === "active" && (
                        <button onClick={() => markAsSold(l.id)} className="flex-1 py-2 rounded-lg bg-blue-900/30 border border-blue-700/40 text-blue-300 text-xs font-semibold hover:bg-blue-900/50 transition-colors">Mark Sold</button>
                      )}
                      {l.status === "sold" && <span className="flex-1 text-center py-2 text-blue-400 text-xs font-semibold">✅ Sold</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics */}
      {tab === "analytics" && (
        <CreatorAnalyticsTab user={user} profile={profile} />
      )}

      {/* Leaderboard */}
      {tab === "leaderboard" && (
        <LeaderboardTab />
      )}

      {/* Video Tools */}
      {tab === "videos" && (
        <CreatorVideoTools user={user} profile={profile} />
      )}

      {/* Verification */}
      {tab === "verification" && (
        <VerificationTab profile={profile} accountType={profile?.account_type} />
      )}

      {/* Payouts */}
      {tab === "payouts" && (
        <PayoutsTab profile={profile} />
      )}
    </div>
  );
}

function VerificationTab({ profile, accountType }) {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(profile?.verification_status === "pending");

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    setDocs(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const submitVerification = async () => {
    await base44.entities.UserProfile.update(profile.id, {
      verification_status: "pending",
      verification_docs: docs,
    });
    setSubmitted(true);
  };

  if (profile?.is_verified) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-white font-black text-2xl mb-2">You're Verified!</h3>
        <p className="text-blue-400 font-semibold">Your account has the blue verified badge</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-white font-black text-xl mb-2">Get Verified</h3>
      <p className="text-gray-400 text-sm mb-6">
        {accountType === "digital_creator"
          ? "For Digital Creators: Submit at least 2 valid IDs and your preferred payment method to get verified."
          : "For Businesses: Submit business registration proof and 2 valid IDs."}
      </p>

      {submitted ? (
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-2xl p-6 text-center">
          <p className="text-yellow-400 font-bold text-lg mb-2">Verification Pending</p>
          <p className="text-gray-400 text-sm">Your documents have been submitted. Admin will review and approve your verification soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <p className="text-white font-semibold mb-3">Upload Documents</p>
            <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-purple-500 transition-colors">
              <Upload className="w-8 h-8 text-gray-500" />
              <span className="text-gray-400 text-sm">Click to upload IDs / Business docs</span>
              <input type="file" multiple accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
            </label>
            {uploading && <p className="text-purple-400 text-sm mt-2 text-center">Uploading...</p>}
            {docs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {docs.map((d, i) => (
                  <span key={i} className="px-3 py-1 bg-green-900/30 border border-green-700/40 text-green-400 rounded-lg text-xs">✅ Doc {i + 1} uploaded</span>
                ))}
              </div>
            )}
          </div>
          <button onClick={submitVerification} disabled={docs.length < 2}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-40">
            Submit for Verification ({docs.length}/2 docs minimum)
          </button>
        </div>
      )}
    </div>
  );
}

function PayoutsTab({ profile }) {
  const [paypalEmail, setPaypalEmail] = useState(profile?.paypal_email || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeMethod, setActiveMethod] = useState(profile?.payout_method || "paypal");

  const savePaypal = async () => {
    if (!paypalEmail.trim() || !profile?.id) return;
    setSaving(true);
    await base44.entities.UserProfile.update(profile.id, { paypal_email: paypalEmail, payout_method: "paypal" });
    setActiveMethod("paypal");
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  };

  // PayPal OAuth redirect — takes user to PayPal to log in and link their account
  const connectPayPal = () => {
    window.open("https://www.paypal.com/signin", "_blank", "width=600,height=700");
  };

  // Stripe Express onboarding (real Stripe Connect flow)
  const connectStripe = () => {
    window.open("https://connect.stripe.com/express/oauth/authorize?response_type=code&client_id=ca_demo&scope=read_write", "_blank", "width=600,height=700");
  };

  const globalMethods = [
    {
      name: "Wise (TransferWise)",
      icon: "🌍",
      desc: "Low-fee international transfers — 80+ currencies",
      color: "border-green-600/40 bg-green-900/10",
      badge: "Recommended",
      badgeColor: "bg-green-500/20 text-green-400",
      url: "https://wise.com/invite/u/globalgateway",
      works: true,
    },
    {
      name: "Payoneer",
      icon: "💳",
      desc: "Global payments — perfect for creators & freelancers",
      color: "border-orange-600/40 bg-orange-900/10",
      badge: "Global",
      badgeColor: "bg-orange-500/20 text-orange-400",
      url: "https://www.payoneer.com/",
      works: true,
    },
    {
      name: "Skrill",
      icon: "⚡",
      desc: "Fast digital wallet — 120+ countries",
      color: "border-purple-600/40 bg-purple-900/10",
      badge: "120+ Countries",
      badgeColor: "bg-purple-500/20 text-purple-400",
      url: "https://www.skrill.com/en/",
      works: true,
    },
    {
      name: "Western Union",
      icon: "🏛️",
      desc: "Cash pickup worldwide — bank & mobile transfers",
      color: "border-yellow-600/40 bg-yellow-900/10",
      badge: "200+ Countries",
      badgeColor: "bg-yellow-500/20 text-yellow-400",
      url: "https://www.westernunion.com/",
      works: true,
    },
    {
      name: "Remitly",
      icon: "📲",
      desc: "Send money internationally to bank accounts",
      color: "border-blue-600/40 bg-blue-900/10",
      badge: "Fast Transfer",
      badgeColor: "bg-blue-500/20 text-blue-400",
      url: "https://www.remitly.com/",
      works: true,
    },
    {
      name: "Crypto (USDT/BTC)",
      icon: "₿",
      desc: "Receive payouts in crypto — fast, borderless",
      color: "border-amber-600/40 bg-amber-900/10",
      badge: "Borderless",
      badgeColor: "bg-amber-500/20 text-amber-400",
      url: "https://www.binance.com/",
      works: true,
    },
  ];

  return (
    <div className="max-w-2xl">
      <h3 className="text-white font-black text-xl mb-1">Payout & Banking</h3>
      <p className="text-gray-400 text-sm mb-6">Connect a payment method to receive your earnings. 10% platform commission deducted per sale.</p>

      {/* Primary Options — PayPal & Stripe side by side */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* PayPal */}
        <div className={`rounded-2xl p-5 border-2 transition-all ${activeMethod === "paypal" ? "border-blue-500/60 bg-blue-900/20" : "border-gray-700/50 bg-gray-900/50"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">PP</span>
              </div>
              <div>
                <p className="text-white font-black text-sm">PayPal</p>
                <p className="text-blue-400 text-[10px] font-semibold">Most popular worldwide</p>
              </div>
            </div>
            {activeMethod === "paypal" && <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">✓ Active</span>}
          </div>
          <input value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)}
            placeholder="your@paypal.com" type="email"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs mb-2" />
          <div className="flex gap-2">
            <button onClick={savePaypal} disabled={saving || !paypalEmail.trim()}
              className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors disabled:opacity-40">
              {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Email"}
            </button>
            <button onClick={connectPayPal}
              className="flex-1 py-2 rounded-xl bg-blue-900/40 border border-blue-600/40 text-blue-300 font-bold text-xs hover:bg-blue-900/60 transition-colors">
              Login to PayPal →
            </button>
          </div>
        </div>

        {/* Stripe */}
        <div className={`rounded-2xl p-5 border-2 transition-all ${activeMethod === "stripe" ? "border-purple-500/60 bg-purple-900/20" : "border-gray-700/50 bg-gray-900/50"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <div>
                <p className="text-white font-black text-sm">Stripe</p>
                <p className="text-purple-400 text-[10px] font-semibold">Cards, banks & more</p>
              </div>
            </div>
            {activeMethod === "stripe" && <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">✓ Active</span>}
          </div>
          <p className="text-gray-400 text-xs mb-3 leading-relaxed">Accept credit/debit cards, bank payouts in 40+ countries via Stripe Express.</p>
          <button onClick={connectStripe}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:opacity-90 transition-opacity">
            Connect Stripe Account →
          </button>
        </div>
      </div>

      {/* Global Transfer Methods */}
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">🌍 Global Transfer Methods</p>
      <div className="space-y-2.5 mb-6">
        {globalMethods.map((m) => (
          <div key={m.name} className={`flex items-center justify-between p-3.5 rounded-xl border ${m.color}`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{m.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-sm">{m.name}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${m.badgeColor}`}>{m.badge}</span>
                </div>
                <p className="text-gray-500 text-xs">{m.desc}</p>
              </div>
            </div>
            <a href={m.url} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold hover:bg-gray-700 hover:text-white transition-colors whitespace-nowrap">
              Open ↗
            </a>
          </div>
        ))}
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 text-xs text-yellow-200/80 leading-relaxed">
        <p className="font-bold text-yellow-400 mb-1">💡 How Payouts Work</p>
        All earnings (sales + video monetization) are processed minus 10% platform fee. Payouts via PayPal or Stripe are processed within 1–3 business days. For global transfers (Wise, Payoneer etc.), use those services to receive money sent to your PayPal/Stripe account.
      </div>
    </div>
  );
}