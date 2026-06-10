import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, User, Mail, Globe, Store } from "lucide-react";
import { base44 } from "@/api/base44Client";

const COUNTRIES = [
  { name: "Afghanistan", flag: "🇦🇫" }, { name: "Albania", flag: "🇦🇱" }, { name: "Algeria", flag: "🇩🇿" },
  { name: "Andorra", flag: "🇦🇩" }, { name: "Angola", flag: "🇦🇴" }, { name: "Antigua and Barbuda", flag: "🇦🇬" },
  { name: "Argentina", flag: "🇦🇷" }, { name: "Armenia", flag: "🇦🇲" }, { name: "Australia", flag: "🇦🇺" },
  { name: "Austria", flag: "🇦🇹" }, { name: "Azerbaijan", flag: "🇦🇿" }, { name: "Bahamas", flag: "🇧🇸" },
  { name: "Bahrain", flag: "🇧🇭" }, { name: "Bangladesh", flag: "🇧🇩" }, { name: "Barbados", flag: "🇧🇧" },
  { name: "Belarus", flag: "🇧🇾" }, { name: "Belgium", flag: "🇧🇪" }, { name: "Belize", flag: "🇧🇿" },
  { name: "Benin", flag: "🇧🇯" }, { name: "Bhutan", flag: "🇧🇹" }, { name: "Bolivia", flag: "🇧🇴" },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦" }, { name: "Botswana", flag: "🇧🇼" }, { name: "Brazil", flag: "🇧🇷" },
  { name: "Brunei", flag: "🇧🇳" }, { name: "Bulgaria", flag: "🇧🇬" }, { name: "Burkina Faso", flag: "🇧🇫" },
  { name: "Burundi", flag: "🇧🇮" }, { name: "Cambodia", flag: "🇰🇭" }, { name: "Cameroon", flag: "🇨🇲" },
  { name: "Canada", flag: "🇨🇦" }, { name: "Cape Verde", flag: "🇨🇻" }, { name: "Central African Republic", flag: "🇨🇫" },
  { name: "Chad", flag: "🇹🇩" }, { name: "Chile", flag: "🇨🇱" }, { name: "China", flag: "🇨🇳" },
  { name: "Colombia", flag: "🇨🇴" }, { name: "Comoros", flag: "🇰🇲" }, { name: "Congo", flag: "🇨🇬" },
  { name: "Costa Rica", flag: "🇨🇷" }, { name: "Croatia", flag: "🇭🇷" }, { name: "Cuba", flag: "🇨🇺" },
  { name: "Cyprus", flag: "🇨🇾" }, { name: "Czech Republic", flag: "🇨🇿" }, { name: "Denmark", flag: "🇩🇰" },
  { name: "Djibouti", flag: "🇩🇯" }, { name: "Dominica", flag: "🇩🇲" }, { name: "Dominican Republic", flag: "🇩🇴" },
  { name: "East Timor", flag: "🇹🇱" }, { name: "Ecuador", flag: "🇪🇨" }, { name: "Egypt", flag: "🇪🇬" },
  { name: "El Salvador", flag: "🇸🇻" }, { name: "Equatorial Guinea", flag: "🇬🇶" }, { name: "Eritrea", flag: "🇪🇷" },
  { name: "Estonia", flag: "🇪🇪" }, { name: "Ethiopia", flag: "🇪🇹" }, { name: "Fiji", flag: "🇫🇯" },
  { name: "Finland", flag: "🇫🇮" }, { name: "France", flag: "🇫🇷" }, { name: "Gabon", flag: "🇬🇦" },
  { name: "Gambia", flag: "🇬🇲" }, { name: "Georgia", flag: "🇬🇪" }, { name: "Germany", flag: "🇩🇪" },
  { name: "Ghana", flag: "🇬🇭" }, { name: "Greece", flag: "🇬🇷" }, { name: "Grenada", flag: "🇬🇩" },
  { name: "Guatemala", flag: "🇬🇹" }, { name: "Guinea", flag: "🇬🇳" }, { name: "Guinea-Bissau", flag: "🇬🇼" },
  { name: "Guyana", flag: "🇬🇾" }, { name: "Haiti", flag: "🇭🇹" }, { name: "Honduras", flag: "🇭🇳" },
  { name: "Hungary", flag: "🇭🇺" }, { name: "Iceland", flag: "🇮🇸" }, { name: "India", flag: "🇮🇳" },
  { name: "Indonesia", flag: "🇮🇩" }, { name: "Iran", flag: "🇮🇷" }, { name: "Iraq", flag: "🇮🇶" },
  { name: "Ireland", flag: "🇮🇪" }, { name: "Israel", flag: "🇮🇱" }, { name: "Italy", flag: "🇮🇹" },
  { name: "Ivory Coast", flag: "🇨🇮" }, { name: "Jamaica", flag: "🇯🇲" }, { name: "Japan", flag: "🇯🇵" },
  { name: "Jordan", flag: "🇯🇴" }, { name: "Kazakhstan", flag: "🇰🇿" }, { name: "Kenya", flag: "🇰🇪" },
  { name: "Kiribati", flag: "🇰🇮" }, { name: "Kuwait", flag: "🇰🇼" }, { name: "Kyrgyzstan", flag: "🇰🇬" },
  { name: "Laos", flag: "🇱🇦" }, { name: "Latvia", flag: "🇱🇻" }, { name: "Lebanon", flag: "🇱🇧" },
  { name: "Lesotho", flag: "🇱🇸" }, { name: "Liberia", flag: "🇱🇷" }, { name: "Libya", flag: "🇱🇾" },
  { name: "Liechtenstein", flag: "🇱🇮" }, { name: "Lithuania", flag: "🇱🇹" }, { name: "Luxembourg", flag: "🇱🇺" },
  { name: "Macedonia", flag: "🇲🇰" }, { name: "Madagascar", flag: "🇲🇬" }, { name: "Malawi", flag: "🇲🇼" },
  { name: "Malaysia", flag: "🇲🇾" }, { name: "Maldives", flag: "🇲🇻" }, { name: "Mali", flag: "🇲🇱" },
  { name: "Malta", flag: "🇲🇹" }, { name: "Marshall Islands", flag: "🇲🇭" }, { name: "Mauritania", flag: "🇲🇷" },
  { name: "Mauritius", flag: "🇲🇺" }, { name: "Mexico", flag: "🇲🇽" }, { name: "Micronesia", flag: "🇫🇲" },
  { name: "Moldova", flag: "🇲🇩" }, { name: "Monaco", flag: "🇲🇨" }, { name: "Mongolia", flag: "🇲🇳" },
  { name: "Montenegro", flag: "🇲🇪" }, { name: "Morocco", flag: "🇲🇦" }, { name: "Mozambique", flag: "🇲🇿" },
  { name: "Myanmar", flag: "🇲🇲" }, { name: "Namibia", flag: "🇳🇦" }, { name: "Nauru", flag: "🇳🇷" },
  { name: "Nepal", flag: "🇳🇵" }, { name: "Netherlands", flag: "🇳🇱" }, { name: "New Zealand", flag: "🇳🇿" },
  { name: "Nicaragua", flag: "🇳🇮" }, { name: "Niger", flag: "🇳🇪" }, { name: "Nigeria", flag: "🇳🇬" },
  { name: "North Korea", flag: "🇰🇵" }, { name: "Norway", flag: "🇳🇴" }, { name: "Oman", flag: "🇴🇲" },
  { name: "Pakistan", flag: "🇵🇰" }, { name: "Palau", flag: "🇵🇼" }, { name: "Palestine", flag: "🇵🇸" },
  { name: "Panama", flag: "🇵🇦" }, { name: "Papua New Guinea", flag: "🇵🇬" }, { name: "Paraguay", flag: "🇵🇾" },
  { name: "Peru", flag: "🇵🇪" }, { name: "Philippines", flag: "🇵🇭" }, { name: "Poland", flag: "🇵🇱" },
  { name: "Portugal", flag: "🇵🇹" }, { name: "Qatar", flag: "🇶🇦" }, { name: "Romania", flag: "🇷🇴" },
  { name: "Russia", flag: "🇷🇺" }, { name: "Rwanda", flag: "🇷🇼" }, { name: "Saint Kitts and Nevis", flag: "🇰🇳" },
  { name: "Saint Lucia", flag: "🇱🇨" }, { name: "Saint Vincent and the Grenadines", flag: "🇻🇨" },
  { name: "Samoa", flag: "🇼🇸" }, { name: "San Marino", flag: "🇸🇲" }, { name: "Sao Tome and Principe", flag: "🇸🇹" },
  { name: "Saudi Arabia", flag: "🇸🇦" }, { name: "Senegal", flag: "🇸🇳" }, { name: "Serbia", flag: "🇷🇸" },
  { name: "Seychelles", flag: "🇸🇨" }, { name: "Sierra Leone", flag: "🇸🇱" }, { name: "Singapore", flag: "🇸🇬" },
  { name: "Slovakia", flag: "🇸🇰" }, { name: "Slovenia", flag: "🇸🇮" }, { name: "Solomon Islands", flag: "🇸🇧" },
  { name: "Somalia", flag: "🇸🇴" }, { name: "South Africa", flag: "🇿🇦" }, { name: "South Korea", flag: "🇰🇷" },
  { name: "South Sudan", flag: "🇸🇸" }, { name: "Spain", flag: "🇪🇸" }, { name: "Sri Lanka", flag: "🇱🇰" },
  { name: "Sudan", flag: "🇸🇩" }, { name: "Suriname", flag: "🇸🇷" }, { name: "Swaziland", flag: "🇸🇿" },
  { name: "Sweden", flag: "🇸🇪" }, { name: "Switzerland", flag: "🇨🇭" }, { name: "Syria", flag: "🇸🇾" },
  { name: "Taiwan", flag: "🇹🇼" }, { name: "Tajikistan", flag: "🇹🇯" }, { name: "Tanzania", flag: "🇹🇿" },
  { name: "Thailand", flag: "🇹🇭" }, { name: "Togo", flag: "🇹🇬" }, { name: "Tonga", flag: "🇹🇴" },
  { name: "Trinidad and Tobago", flag: "🇹🇹" }, { name: "Tunisia", flag: "🇹🇳" }, { name: "Turkey", flag: "🇹🇷" },
  { name: "Turkmenistan", flag: "🇹🇲" }, { name: "Tuvalu", flag: "🇹🇻" }, { name: "Uganda", flag: "🇺🇬" },
  { name: "Ukraine", flag: "🇺🇦" }, { name: "United Arab Emirates", flag: "🇦🇪" }, { name: "United Kingdom", flag: "🇬🇧" },
  { name: "United States", flag: "🇺🇸" }, { name: "Uruguay", flag: "🇺🇾" }, { name: "Uzbekistan", flag: "🇺🇿" },
  { name: "Vanuatu", flag: "🇻🇺" }, { name: "Vatican City", flag: "🇻🇦" }, { name: "Venezuela", flag: "🇻🇪" },
  { name: "Vietnam", flag: "🇻🇳" }, { name: "Yemen", flag: "🇾🇪" }, { name: "Zambia", flag: "🇿🇲" },
  { name: "Zimbabwe", flag: "🇿🇼" }
];

export default function EditProfileModal({ profile, user, onClose, onSaved }) {
  const [form, setForm] = useState({
    username: profile?.username || "",
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    favorite_sports_team: profile?.favorite_sports_team || "",
    favorite_game: profile?.favorite_game || "",
    favorite_hobby: profile?.favorite_hobby || "",
    business_name: profile?.business_name || "",
    email: user?.email || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isTier1, setIsTier1] = useState(false);
  
  // Check if this is a ghost session
  const isGhostSession = user?.isGhostAccount || JSON.parse(localStorage.getItem('impersonation_session') || '{}')?.isGhostLogin;

  useEffect(() => {
    if (user?.email) {
      base44.entities.Tier1Subscription.filter({ user_email: user.email, status: "active" }).then(subs => {
        setIsTier1(subs.length > 0);
      });
    }
  }, [user?.email]);

  const handleSave = async () => {
    if (!form.username.trim()) { setError("Username is required"); return; }
    setSaving(true);
    try {
      const updateData = {
        username: form.username.trim(),
        display_name: form.display_name.trim() || form.username.trim(),
        bio: form.bio.trim(),
        location: form.location,
        favorite_sports_team: form.favorite_sports_team.trim(),
        favorite_game: form.favorite_game.trim(),
        favorite_hobby: form.favorite_hobby.trim(),
        business_name: form.business_name.trim(),
      };
      
      // Ghost accounts can update their email
      if (isGhostSession && form.email && form.email !== user?.email) {
        updateData.user_email = form.email;
      }
      
      await base44.entities.UserProfile.update(profile.id, updateData);
      
      // If email was changed for ghost account, also update the User entity
      if (updateData.user_email) {
        await base44.entities.User.update(profile.id, { email: form.email });
      }
      
      onSaved?.({ ...profile, ...form });
      onClose();
    } catch (e) {
      setError(e.message || "Failed to save");
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-950 border border-purple-700/40 rounded-3xl p-7 w-full max-w-md shadow-2xl"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-black text-xl">Edit Profile</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons at TOP */}
          <div className="flex gap-3 mb-5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 font-semibold text-sm hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              <Check className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
                <input
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, "") }))}
                  placeholder="yourusername"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-8 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Display Name (First + Last) */}
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">Display Name (First &amp; Last)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={form.display_name}
                  onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Email — editable for ghost accounts */}
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={!isGhostSession}
                  placeholder={isGhostSession ? "Enter new email" : "Email"}
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500 ${
                    isGhostSession 
                      ? "bg-gray-900 border-gray-700 text-white placeholder-gray-600" 
                      : "bg-gray-800/50 border-gray-700/50 text-gray-500 cursor-not-allowed"
                  }`}
                />
              </div>
              {isGhostSession ? (
                <p className="text-purple-400 text-[10px] mt-1">✨ Ghost accounts can update their linked email</p>
              ) : (
                <p className="text-gray-600 text-[10px] mt-1">Email is managed by your login provider</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell the world about yourself..."
                rows={3}
                maxLength={200}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
              />
              <p className="text-gray-600 text-[10px] text-right">{form.bio.length}/200</p>
            </div>

            {/* Nation */}
            <div>
              <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide">
                <Globe className="w-3 h-3 inline mr-1" />Nation
              </label>
              <select
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Select your nation...</option>
                {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
              </select>
            </div>

            {/* Favorites Section */}
            <div className="pt-3 border-t border-gray-800">
              <p className="text-purple-400 text-xs font-bold mb-3 uppercase tracking-wide">🎯 Favorites (Optional)</p>
              
              {/* Favorite Sports Team */}
              <div className="mb-3">
                <label className="text-gray-400 text-xs font-bold mb-1 block">Favorite Sports Team</label>
                <input
                  value={form.favorite_sports_team}
                  onChange={e => setForm(f => ({ ...f, favorite_sports_team: e.target.value }))}
                  placeholder="e.g. Manchester United, Lakers, All Blacks"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Favorite Game */}
              <div className="mb-3">
                <label className="text-gray-400 text-xs font-bold mb-1 block">Favorite Game</label>
                <input
                  value={form.favorite_game}
                  onChange={e => setForm(f => ({ ...f, favorite_game: e.target.value }))}
                  placeholder="e.g. FIFA 25, Elden Ring, Valorant"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Favorite Hobby */}
              <div>
                <label className="text-gray-400 text-xs font-bold mb-1 block">Favorite Hobby</label>
                <input
                  value={form.favorite_hobby}
                  onChange={e => setForm(f => ({ ...f, favorite_hobby: e.target.value }))}
                  placeholder="e.g. Photography, Cooking, Hiking"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Business Name - Tier 1 Only */}
            {isTier1 && (profile?.account_type === "digital_creator" || profile?.account_type === "business") && (
              <div className="pt-3 border-t border-gray-800">
                <p className="text-green-400 text-xs font-bold mb-3 uppercase tracking-wide flex items-center gap-1">
                  <Store className="w-3 h-3" /> Verified Seller Profile
                </p>
                <div>
                  <label className="text-gray-400 text-xs font-bold mb-1 block">Business Name (Displayed on Store)</label>
                  <input
                    value={form.business_name}
                    onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                    placeholder="e.g. Kevin's Gaming Store"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500"
                  />
                  <p className="text-gray-600 text-[10px] mt-1">This name will appear on your Store listings instead of your username</p>
                </div>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}