import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, BarChart2, Package, CreditCard, Plus, CheckCircle, Upload, DollarSign, Youtube, LogOut, Flame } from "lucide-react";
import YoutubeConnectHighlight from "@/components/social/YoutubeConnectHighlight";
import MonetizationHighlights from "@/components/monetization/MonetizationHighlights";
import StreakTracker from "@/components/rewards/StreakTracker";
import SellerTrafficInsights from "@/components/dashboard/SellerTrafficInsights";
import { base44 } from "@/api/base44Client";
import CreatorVideoTools from "./CreatorVideoTools";
import CreatorAnalyticsTab from "./CreatorAnalyticsTab";
import SalesDashboard from "./SalesDashboard";
import LeaderboardTab from "./LeaderboardTab";
import GamerCheckmark from "@/components/shared/GamerCheckmark";
import PaymentMethodsTab from "./PaymentMethodsTab";
import PayPalConnect from "@/components/payments/PayPalConnect";
import PaymentSettingsTab from "./PaymentSettingsTab";
import PaymentBillingSettings from "./PaymentBillingSettings";
import AdvancedAnalytics from "./AdvancedAnalytics";

export default function SellerDashboard({ user, profile }) {
  const [tab, setTab] = useState("overview");
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localProfile, setLocalProfile] = useState(profile);

  useEffect(() => { setLocalProfile(profile); }, [profile]);

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
    { id: "traffic", label: "📈 Traffic Insights", icon: BarChart2 },
    { id: "earn", label: "💰 Monetize", icon: DollarSign },
    { id: "rewards", label: "🔥 Daily Streak", icon: Flame },
    { id: "listings", label: "My Listings", icon: Store },
    { id: "orders", label: "Orders", icon: Package },
    { id: "sales", label: "📈 Sales Dashboard", icon: DollarSign },
    { id: "analytics", label: "📊 Analytics", icon: BarChart2 },
    { id: "videos", label: "📹 Video Tools", icon: Youtube },
    { id: "leaderboard", label: "🏆 Leaderboard", icon: DollarSign },
    { id: "payouts", label: "💳 Payment Settings", icon: CreditCard },
    { id: "verification", label: isVerified ? "✅ Verified" : "Get Verified", icon: CheckCircle },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Vertical Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col py-6 px-3 sticky top-0 h-screen overflow-y-auto hidden md:flex z-20">
        {/* User info */}
        <div className="flex flex-col items-center text-center gap-2 mb-6 px-2">
          <div className="w-14 h-14 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <Store className="w-7 h-7 text-purple-400" />}
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight">{profile?.username || user?.full_name}</p>
            <p className="text-purple-400 text-[10px] font-semibold mt-0.5">
              {profile?.account_type === "digital_creator" ? "🎨 Creator" : "🏢 Business"}
            </p>
            <p className="text-gray-500 text-[9px] truncate max-w-[130px]">{user?.email}</p>
          </div>
        </div>

        <a href="/create-listing"
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold hover:opacity-90 transition-opacity mb-4">
          <Plus className="w-3.5 h-3.5" /> New Listing
        </a>

        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${tab === t.id ? "bg-purple-500/20 border border-purple-500/40 text-purple-300" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
              <t.icon className="w-4 h-4 shrink-0" />{t.label}
            </button>
          ))}
        </nav>

        <button onClick={() => base44.auth.logout("/")}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-900/20 border border-red-700/30 text-red-400 text-sm font-semibold hover:bg-red-900/40 transition-colors mt-4">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </aside>

      {/* Mobile horizontal tabs */}
      <div className="md:hidden w-full absolute top-16 left-0 z-20 bg-gray-950 border-b border-gray-800 px-3 py-2 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${tab === t.id ? "bg-purple-500/20 border border-purple-500/50 text-purple-300" : "bg-gray-900 border border-gray-800 text-gray-400"}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:pt-8 pt-20 bg-gray-950">

      {tab === "traffic" && (
        <SellerTrafficInsights user={user} listings={listings} orders={orders} />
      )}

      {tab === "earn" && (
        <div>
          <h3 className="text-white font-black text-lg mb-4">Monetization Options 💰</h3>
          <div className="mb-5 bg-green-900/20 border border-green-600/30 rounded-2xl p-4">
            <p className="text-green-300 font-black text-sm mb-1">💵 $1 per 1,000 Views — Once Monetized</p>
            <p className="text-gray-400 text-xs">Upload content, grow your audience, and earn $1 for every 1,000 views. Apply for monetization from your channel settings.</p>
          </div>
          <MonetizationHighlights />
        </div>
      )}

      {tab === "rewards" && (
        <div className="max-w-lg">
          <h3 className="text-white font-black text-lg mb-4">Daily Login Streak 🔥</h3>
          <StreakTracker userEmail={user?.email} />
          <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h4 className="text-white font-bold mb-2">How it works</h4>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>🔥 Log in every day to build your streak</li>
              <li>📅 365 consecutive days = <strong className="text-yellow-400">$10 cash reward</strong></li>
              <li>❌ Missing one day resets your streak to 0</li>
            </ul>
          </div>
        </div>
      )}

      {/* Overview */}
      {tab === "overview" && (
        <div>
          <YoutubeConnectHighlight profile={profile} user={user} />
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

      {/* Orders */}
      {tab === "orders" && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h3 className="text-white font-bold">Order History ({orders.length})</h3>
          </div>
          {orders.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>{["Item", "Buyer", "Amount", "Your Payout", "Payment", "Order", "Date"].map(h => <th key={h} className="px-4 py-3 text-left text-gray-400 font-semibold text-xs">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-3 text-white text-xs font-medium max-w-[120px] truncate">{o.listing_title}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{o.buyer_email}</td>
                      <td className="px-4 py-3 text-green-400 font-bold text-xs">₱{o.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-purple-400 font-bold text-xs">₱{o.seller_payout?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.payment_status === "paid" ? "bg-green-900/50 text-green-400" : "bg-yellow-900/50 text-yellow-400"}`}>{o.payment_status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${o.order_status === "completed" ? "bg-blue-900/50 text-blue-400" : o.order_status === "cancelled" ? "bg-red-900/50 text-red-400" : "bg-gray-800 text-gray-400"}`}>{o.order_status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.created_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sales Dashboard */}
      {tab === "sales" && (
        <SalesDashboard user={user} />
      )}

      {/* Analytics */}
      {tab === "analytics" && (
        <div className="space-y-8">
          <AdvancedAnalytics user={user} profile={profile} sellerOnly={true} />
          <CreatorAnalyticsTab user={user} profile={profile} />
        </div>
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

      {/* Payment Settings - Unified PayPal + Stripe */}
      {tab === "payouts" && (
        <PaymentBillingSettings user={user} profile={localProfile} onProfileUpdate={setLocalProfile} />
      )}

      </main>
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
      <p className="text-gray-400 text-sm mb-4">
        {accountType === "digital_creator"
          ? "For Digital Creators: Submit at least 2 valid IDs and your preferred payment method to get verified."
          : "For Businesses: Submit business registration proof and 2 valid IDs."}
      </p>

      {/* Checkmark Preview */}
      <div className="bg-gray-900 border border-purple-700/30 rounded-2xl p-5 mb-6">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">What your verified badge will look like:</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-600/50 flex items-center justify-center text-sm">🎮</div>
            <span className="text-white font-bold text-sm">YourUsername</span>
            <GamerCheckmark isVerified={true} size="sm" showTooltip={false} />
          </div>
          <div className="text-gray-500 text-xs">← Your profile will show this double-glow checkmark ✓✓</div>
        </div>
        <p className="text-purple-400 text-xs mt-3 font-semibold">The animated glowing double-checkmark appears next to your name everywhere on the platform.</p>
      </div>

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