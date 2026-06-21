import React, { useState } from "react";
import { UserPlus, Check } from "lucide-react";
import { toast } from "sonner";

// "Invite to follow" — copies/shares a link that opens this user's profile,
// nudging people to follow them. Works on their own profile or another's.
export default function InviteFollowButton({ targetEmail, targetUsername, size = "sm" }) {
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    const url = `${window.location.origin}/profile?email=${encodeURIComponent(targetEmail || "")}`;
    const text = `Follow ${targetUsername || "this gamer"} on Gamer.Productions! 🎮`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Follow on Gamer.Productions", text, url });
        return;
      }
    } catch { /* user cancelled share — fall through to copy */ }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const sizeClass = size === "sm"
    ? "px-3 py-1.5 text-xs rounded-lg gap-1.5"
    : "px-5 py-2.5 text-sm rounded-xl gap-2";

  return (
    <button
      onClick={handleInvite}
      className={`flex items-center font-bold transition-all bg-cyan-600 hover:bg-cyan-500 text-white ${sizeClass}`}
    >
      {copied ? <Check className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} /> : <UserPlus className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />}
      Invite to Follow
    </button>
  );
}