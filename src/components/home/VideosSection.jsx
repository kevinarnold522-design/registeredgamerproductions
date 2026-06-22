import React from "react";
import { motion } from "framer-motion";
import { Youtube, Play } from "lucide-react";
import VideoFeed from "@/components/videos/VideoFeed";

export default function VideosSection() {
  return (
    <section className="py-16 px-4 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
                <Youtube className="w-4 h-4 text-white" />
              </div>
              <p className="text-red-400 text-sm font-semibold uppercase tracking-wider">Community Videos</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Gaming <span className="bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">Videos</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Shared by our community creators</p>
          </motion.div>
          <a href="/dashboard" className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors">
            Share Your Video →
          </a>
        </div>
        <VideoFeed limit={8} />
      </div>
    </section>
  );
}