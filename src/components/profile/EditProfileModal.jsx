import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Edit2, User, Mail, Globe, Store } from "lucide-react";
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
  const [originalData, setOriginalData] = useState({
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
  
  const [form, setForm] = useState({ ...originalData });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isTier1, setIsTier1] = useState(false);
  const [editingField, setEditingField] = useState(null);
  
  const isGhostSession = user?.isGhostAccount || JSON.parse(localStorage.getItem('impersonation_session') || '{}')?.isGhostLogin;

  useEffect(() => {
    if (user?.email) {
      base44.entities.Tier1Subscription.filter({ user_email: user.email, status: "active" }).then(subs => {
        setIsTier1(subs.length > 0);
      });
    }
  }, [user?.email]);

  const handleFieldEdit = (field) => {
    setEditingField(field);
    setForm({ ...originalData });
  };

  const handleCancelEdit = () => {
    setForm({ ...originalData });
    setEditingField(null);
  };

  const handleSaveField = async (field) => {
    if (field === "username" && !form.username.trim()) {
      setError("Username is required");
      return;
    }
    
    setSaving(true);
    try {
      const updateData = {};
      
      if (field === "email") {
        if (isGhostSession && form.email && form.email !== user?.email) {
          updateData.user_email = form.email;
          await base44.entities.UserProfile.update(profile.id, updateData);
          await base44.entities.User.update(profile.id, { email: form.email });
          setOriginalData({ ...originalData, email: form.email });
        }
      } else {
        updateData[field] = field === "username" ? form.username.trim() : form[field]?.trim() || "";
        await base44.entities.UserProfile.update(profile.id, updateData);
        setOriginalData({ ...originalData, [field]: form[field] });
      }
      
      setEditingField(null);
      onSaved?.({ ...profile, ...form });
    } catch (e) {
      setError(e.message || "Failed to save");
      setForm({ ...originalData });
    }
    setSaving(false);
  };

  const handleDone = async () => {
    if (!form.username.trim()) {
      setError("Username is required");
      return;
    }
    
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
      
      if (isGhostSession && form.email && form.email !== originalData.email) {
        updateData.user_email = form.email;
      }
      
      await base44.entities.UserProfile.update(profile.id, updateData);
      
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

  const renderField = (label, field, Icon, placeholder, isTextarea = false, isSelect = false, options = []) => {
    const isEditing = editingField === field;

    return (
      <div key={field} className="relative">
        <label className="text-gray-400 text-xs font-bold mb-1 block uppercase tracking-wide flex items-center gap-1">
          {Icon && <Icon className="w-3 h-3" />}
          {label}
        </label>
        
        <div className="flex items-start gap-2">
          <div className={`flex-1 transition-all ${isEditing ? 'opacity-100' : 'opacity-50'}`}>
            {isSelect ? (
              <select
                value={form[field] || ""}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                disabled={!isEditing}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-all ${
                  isEditing 
                    ? "bg-gray-900 border-gray-700 text-white" 
                    : "bg-gray-800/50 border-gray-700/50 text-gray-300 cursor-default"
                }`}
              >
                <option value="">Select...</option>
                {options.map(opt => (
                  <option key={opt.name} value={opt.name}>{opt.flag} {opt.name}</option>
                ))}
              </select>
            ) : isTextarea ? (
              <textarea
                value={form[field] || ""}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                disabled={!isEditing}
                placeholder={placeholder}
                rows={3}
                maxLength={200}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none transition-all ${
                  isEditing 
                    ? "bg-gray-900 border-gray-700 text-white" 
                    : "bg-gray-800/50 border-gray-700/50 text-gray-300 cursor-default"
                }`}
              />
            ) : (
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={form[field] || ""}
                onChange={e => setForm(f => ({ ...f, [field]: field === 'username' ? e.target.value.toLowerCase().replace(/\s/g, "") : e.target.value }))}
                disabled={!isEditing}
                placeholder={placeholder}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all ${
                  isEditing 
                    ? "bg-gray-900 border-gray-700 text-white" 
                    : "bg-gray-800/50 border-gray-700/50 text-gray-300 cursor-default"
                }`}
              />
            )}
            
            {isTextarea && (
              <p className="text-gray-600 text-[10px] text-right mt-1">{(form[field] || '').length}/200</p>
            )}
            
            {field === 'email' && (
              <p className={`text-[10px] mt-1 ${isGhostSession ? 'text-purple-400' : 'text-gray-600'}`}>
                {isGhostSession ? '✨ Ghost accounts can update email' : 'Email managed by login provider'}
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-1 flex-shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleSaveField(field)}
                  disabled={saving}
                  className="w-8 h-8 rounded-lg bg-green-600 hover:bg-green-500 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleFieldEdit(field)}
                className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-600/40 text-purple-400 hover:bg-purple-600/30 flex items-center justify-center transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
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
          className="bg-gray-950 border border-purple-700/40 rounded-3xl p-7 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-black text-xl">Edit Profile</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {renderField("Username", "username", User, "yourusername")}
            {renderField("Display Name", "display_name", null, "Your full name")}
            {renderField("Email", "email", Mail, "email@example.com")}
            {renderField("Bio", "bio", null, "Tell the world about yourself...", true)}
            {renderField("Nation", "location", Globe, "Select your nation", false, true, COUNTRIES)}
            
            <div className="pt-3 border-t border-gray-800">
              <p className="text-purple-400 text-xs font-bold mb-3 uppercase tracking-wide">🎯 Favorites</p>
              {renderField("Favorite Sports Team", "favorite_sports_team", null, "e.g. Manchester United")}
              {renderField("Favorite Game", "favorite_game", null, "e.g. FIFA 25, Valorant")}
              {renderField("Favorite Hobby", "favorite_hobby", null, "e.g. Photography, Cooking")}
            </div>

            {isTier1 && (profile?.account_type === "digital_creator" || profile?.account_type === "business") && (
              <div className="pt-3 border-t border-gray-800">
                <p className="text-green-400 text-xs font-bold mb-3 uppercase tracking-wide flex items-center gap-1">
                  <Store className="w-3 h-3" /> Business Profile
                </p>
                {renderField("Business Name", "business_name", null, "e.g. Kevin's Gaming Store")}
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

            <button
              onClick={handleDone}
              disabled={saving}
              className="w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
            >
              <Check className="w-4 h-4" />
              {saving ? "Saving..." : "Done"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}