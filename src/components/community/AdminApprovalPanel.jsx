import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Shield, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isAdmin } from "@/lib/constants";

export default function AdminApprovalPanel({ userEmail }) {
  const [open, setOpen] = useState(false);
  const [sectionRequests, setSectionRequests] = useState([]);
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("sections");

  useEffect(() => {
    if (!isAdmin(userEmail)) return;
    if (!open) return;
    setLoading(true);
    Promise.all([
      base44.entities.SectionRequest.filter({ status: "pending" }),
      base44.entities.CommunityPost.filter({ status: "pending_review" }),
    ]).then(([sections, posts]) => {
      setSectionRequests(sections);
      setFlaggedPosts(posts);
    }).finally(() => setLoading(false));
  }, [open]);

  const totalPending = sectionRequests.length + flaggedPosts.length;

  if (!isAdmin(userEmail)) return null;

  const approveSection = async (req) => {
    // Add section to community
    const comms = await base44.entities.GamingCommunity.filter({ franchise_id: req.franchise_id });
    if (comms[0]) {
      const existing = comms[0].sections || [];
      await base44.entities.GamingCommunity.update(comms[0].id, {
        sections: [...existing, { id: Date.now().toString(), name: req.section_name, description: req.section_description }]
      });
    }
    await base44.entities.SectionRequest.update(req.id, { status: "approved" });
    setSectionRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const rejectSection = async (req) => {
    await base44.entities.SectionRequest.update(req.id, { status: "rejected" });
    setSectionRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const keepPost = async (post) => {
    await base44.entities.CommunityPost.update(post.id, { status: "active", flagged_reason: "" });
    setFlaggedPosts(prev => prev.filter(p => p.id !== post.id));
  };

  const removePost = async (post) => {
    await base44.entities.CommunityPost.update(post.id, { status: "removed" });
    setFlaggedPosts(prev => prev.filter(p => p.id !== post.id));
  };

  // Handle moderator requests (stored as section requests with MOD_REQUEST prefix)
  const modRequests = sectionRequests.filter(r => r.section_name?.startsWith("MOD_REQUEST:"));
  const realSectionRequests = sectionRequests.filter(r => !r.section_name?.startsWith("MOD_REQUEST:"));

  const approveMod = async (req) => {
    const email = req.section_name.replace("MOD_REQUEST: ", "").trim();
    const comms = await base44.entities.GamingCommunity.filter({ franchise_id: req.franchise_id });
    if (comms[0]) {
      const mods = comms[0].moderator_emails || [];
      if (!mods.includes(email)) {
        await base44.entities.GamingCommunity.update(comms[0].id, { moderator_emails: [...mods, email] });
      }
    }
    const members = await base44.entities.CommunityMember.filter({ franchise_id: req.franchise_id, user_email: email });
    if (members[0]) await base44.entities.CommunityMember.update(members[0].id, { is_moderator: true });
    await base44.entities.SectionRequest.update(req.id, { status: "approved" });
    setSectionRequests(prev => prev.filter(r => r.id !== req.id));
  };

  return (
    <div className="fixed bottom-20 left-4 z-40">
      {/* Trigger button */}
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm text-white shadow-2xl transition-all"
        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>
        <Shield className="w-4 h-4" />
        Community Approvals
        {totalPending > 0 && (
          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
            {totalPending}
          </span>
        )}
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-14 left-0 w-96 bg-gray-950 border border-purple-700/40 rounded-2xl shadow-2xl overflow-hidden"
            style={{ maxHeight: "70vh" }}
          >
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-black text-sm">Community Approval Queue</h3>
              <div className="flex gap-2 mt-2">
                {["sections", "posts", "mods"].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${tab === t ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                    {t}
                    {t === "sections" && realSectionRequests.length > 0 && (
                      <span className="ml-1 px-1 rounded-full bg-red-500 text-white text-[9px]">{realSectionRequests.length}</span>
                    )}
                    {t === "posts" && flaggedPosts.length > 0 && (
                      <span className="ml-1 px-1 rounded-full bg-red-500 text-white text-[9px]">{flaggedPosts.length}</span>
                    )}
                    {t === "mods" && modRequests.length > 0 && (
                      <span className="ml-1 px-1 rounded-full bg-red-500 text-white text-[9px]">{modRequests.length}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "50vh" }}>
              {loading && <p className="text-gray-500 text-xs p-4 text-center">Loading...</p>}

              {/* Section Requests */}
              {tab === "sections" && !loading && (
                realSectionRequests.length === 0
                  ? <p className="text-gray-600 text-xs p-4 text-center">No pending section requests</p>
                  : realSectionRequests.map(req => (
                    <div key={req.id} className="p-4 border-b border-gray-800">
                      <p className="text-purple-300 text-xs font-bold">{req.franchise_id}</p>
                      <p className="text-white text-sm font-bold mt-0.5">Section: "{req.section_name}"</p>
                      <p className="text-gray-500 text-xs mt-0.5">By: {req.requester_username} · {req.section_description}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => approveSection(req)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-black text-white bg-green-700 hover:bg-green-600 flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => rejectSection(req)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-black text-white bg-red-900 hover:bg-red-800 flex items-center justify-center gap-1">
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
              )}

              {/* Flagged Posts */}
              {tab === "posts" && !loading && (
                flaggedPosts.length === 0
                  ? <p className="text-gray-600 text-xs p-4 text-center">No flagged posts</p>
                  : flaggedPosts.map(post => (
                    <div key={post.id} className="p-4 border-b border-gray-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-orange-300 text-xs font-bold">{post.franchise_id} · by {post.author_username}</p>
                          <p className="text-gray-300 text-sm mt-0.5 line-clamp-3">{post.content}</p>
                          {post.flagged_reason && <p className="text-gray-600 text-[10px] mt-1">Reason: {post.flagged_reason}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => keepPost(post)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-black text-white bg-green-700 hover:bg-green-600 flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Keep Post
                        </button>
                        <button onClick={() => removePost(post)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-black text-white bg-red-900 hover:bg-red-800 flex items-center justify-center gap-1">
                          <X className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))
              )}

              {/* Mod Requests */}
              {tab === "mods" && !loading && (
                modRequests.length === 0
                  ? <p className="text-gray-600 text-xs p-4 text-center">No pending moderator requests</p>
                  : modRequests.map(req => (
                    <div key={req.id} className="p-4 border-b border-gray-800">
                      <p className="text-purple-300 text-xs font-bold">{req.franchise_id}</p>
                      <p className="text-white text-sm font-bold mt-0.5">Mod Request</p>
                      <p className="text-gray-400 text-xs mt-0.5">From: {req.requester_username} ({req.requested_by})</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => approveMod(req)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-black text-white bg-green-700 hover:bg-green-600 flex items-center justify-center gap-1">
                          <Shield className="w-3.5 h-3.5" /> Make Captain
                        </button>
                        <button onClick={() => rejectSection(req)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-black text-white bg-red-900 hover:bg-red-800 flex items-center justify-center gap-1">
                          <X className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}