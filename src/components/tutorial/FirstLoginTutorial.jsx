import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Upload, Video, Store, Users, MessageSquare, Trophy, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ACTIVITIES = [
  {
    id: 1,
    title: "Create Your First Listing",
    description: "Sell a premium mod, skin, or gaming product in the marketplace",
    icon: Store,
    color: "from-purple-600 to-pink-600",
    action: "/create-listing",
    tips: [
      "Upload high-quality images",
      "Set a competitive price",
      "Write a clear description",
      "Choose the right category"
    ]
  },
  {
    id: 2,
    title: "Post a Reel/Video",
    description: "Share gameplay highlights, tutorials, or reviews with the community",
    icon: Video,
    color: "from-red-600 to-orange-600",
    action: "/content",
    tips: [
      "Keep it engaging (15-60 seconds)",
      "Add captions or commentary",
      "Use trending music",
      "Tag relevant games"
    ]
  },
  {
    id: 3,
    title: "Join a Gaming Community",
    description: "Connect with players who share your favorite games",
    icon: Users,
    color: "from-blue-600 to-cyan-600",
    action: "/gaming-community",
    tips: [
      "Browse 50+ franchise communities",
      "Introduce yourself",
      "Participate in discussions",
      "Attend community events"
    ]
  },
  {
    id: 4,
    title: "Start a Conversation",
    description: "Message other members, sellers, or content creators",
    icon: MessageSquare,
    color: "from-green-600 to-emerald-600",
    action: "/messages",
    tips: [
      "Be respectful and friendly",
      "Ask questions about listings",
      "Network with creators",
      "Build your connections"
    ]
  },
  {
    id: 5,
    title: "Join a Tournament",
    description: "Compete in esports tournaments and win prizes",
    icon: Trophy,
    color: "from-yellow-600 to-amber-600",
    action: "/tournaments",
    tips: [
      "Check registration deadlines",
      "Review tournament rules",
      "Practice before competing",
      "Invite your team"
    ]
  }
];

export default function FirstLoginTutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [showingTips, setShowingTips] = useState(true);

  const handleMarkComplete = (activityId) => {
    if (!completedActivities.includes(activityId)) {
      setCompletedActivities([...completedActivities, activityId]);
      toast.success("Activity completed! 🎉");
    }
  };

  const handleNavigate = (url) => {
    window.location.href = url;
  };

  const handleFinish = () => {
    localStorage.setItem("has_seen_tutorial", "true");
    onComplete?.();
  };

  const activity = ACTIVITIES[currentStep];
  const progress = ((currentStep + 1) / ACTIVITIES.length) * 100;
  const Icon = activity.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.9)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-950 border border-purple-700/40 rounded-3xl p-0 w-full max-w-2xl shadow-2xl shadow-purple-900/30 overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-purple-700/30">
            <button
              onClick={handleFinish}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mb-4">
              <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-1">Welcome to GAMER Productions</p>
              <h2 className="text-white font-black text-2xl">Complete Your First Activities</h2>
              <p className="text-gray-400 text-sm mt-1">Let's get you started with these 5 quick tasks</p>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-500 text-xs font-semibold">{currentStep + 1} of {ACTIVITIES.length}</span>
              <span className="text-purple-400 text-xs font-semibold">{Math.round(progress)}% complete</span>
            </div>
          </div>

          {/* Activity Content */}
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activity.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-xl mb-1">{activity.title}</h3>
                <p className="text-gray-400 text-sm">{activity.description}</p>
              </div>
              {completedActivities.includes(activity.id) && (
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <span className="text-lg">💡</span> Pro Tips
                </h4>
                <button
                  onClick={() => setShowingTips(!showingTips)}
                  className="text-purple-400 text-xs font-semibold hover:text-purple-300 transition-colors"
                >
                  {showingTips ? "Hide" : "Show"} Tips
                </button>
              </div>
              
              <AnimatePresence>
                {showingTips && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {activity.tips.map((tip, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-300 text-xs">
                        <Check className="w-3 h-3 text-green-400 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleNavigate(activity.action)}
                className={`flex-1 py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 bg-gradient-to-r ${activity.color} hover:opacity-90 transition-opacity`}
              >
                <Upload className="w-4 h-4" />
                Do This Now
              </button>
              <button
                onClick={() => handleMarkComplete(activity.id)}
                className="px-6 py-3 rounded-xl font-bold text-white text-sm bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Mark Complete
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-6 border-t border-gray-800 bg-gray-900/30 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-2">
              {ACTIVITIES.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep ? "bg-purple-500" :
                    completedActivities.includes(ACTIVITIES[i].id) ? "bg-green-500" :
                    "bg-gray-700"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                if (currentStep < ACTIVITIES.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  handleFinish();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors"
            >
              {currentStep === ACTIVITIES.length - 1 ? "Finish" : "Next"}
              {currentStep < ACTIVITIES.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}