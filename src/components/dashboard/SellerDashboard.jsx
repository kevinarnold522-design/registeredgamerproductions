import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, BarChart2, Package, CreditCard, Plus, CheckCircle, Upload, DollarSign } from "lucide-react";
import { base44 } from "@/api/base44Client";

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
            <p className="text-purple-400 text-sm font-semibold">
              {profile?.account_type === "digital_creator" ? "🎨 Digital Creator" : "🏢 Business"} · {profile?.username}
              {isVerified && <span className="ml-2 text-blue-400">✅ Verified</span>}
            </p>
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
  return (
    <div className="max-w-lg">
      <h3 className="text-white font-black text-xl mb-6">Payout & Banking</h3>
      <div className="space-y-4">
        {[
          { name: "PayPal", icon: "🅿️", desc: "Link your PayPal account for instant payouts", color: "border-blue-700/30 bg-blue-900/10" },
          { name: "GCash", icon: "💚", desc: "Philippine e-wallet — fastest local payouts", color: "border-green-700/30 bg-green-900/10" },
          { name: "BDO", icon: "🏦", desc: "Direct bank transfer to BDO account", color: "border-yellow-700/30 bg-yellow-900/10" },
          { name: "BPI", icon: "🏦", desc: "Direct bank transfer to BPI account", color: "border-red-700/30 bg-red-900/10" },
          { name: "UnionBank", icon: "🏦", desc: "Direct bank transfer to UnionBank account", color: "border-purple-700/30 bg-purple-900/10" },
        ].map((method) => (
          <div key={method.name} className={`flex items-center justify-between p-4 rounded-2xl border ${method.color}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{method.icon}</span>
              <div>
                <p className="text-white font-bold text-sm">{method.name}</p>
                <p className="text-gray-500 text-xs">{method.desc}</p>
              </div>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold hover:bg-gray-700 transition-colors">
              Link
            </button>
          </div>
        ))}
        <p className="text-gray-600 text-xs text-center mt-2">10% platform commission is automatically deducted from each sale.</p>
      </div>
    </div>
  );
}