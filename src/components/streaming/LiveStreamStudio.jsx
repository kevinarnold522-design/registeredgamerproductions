import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Monitor, Camera, Mic, MicOff, VideoOff, Video, Square, Circle, Users, Settings, Share2, AlertTriangle, Maximize2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LiveStreamStudio({ user, profile, onClose }) {
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const [mode, setMode] = useState("camera"); // "camera" | "screen" | "both"
  const [isLive, setIsLive] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState("");
  const [streamTitle, setStreamTitle] = useState("");
  const [viewers, setViewers] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timerRef, setTimerRef] = useState(null);
  const [listing, setListing] = useState(null);
  const [setupStep, setSetupStep] = useState("config"); // "config" | "preview" | "live"

  // Request camera/mic
  const startPreview = async () => {
    setError("");
    try {
      if (mode === "screen" || mode === "both") {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: true,
        });
        screenStreamRef.current = screenStream;
        if (screenRef.current) screenRef.current.srcObject = screenStream;
      }
      if (mode === "camera" || mode === "both") {
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: camOn,
          audio: micOn,
        });
        streamRef.current = camStream;
        if (videoRef.current) videoRef.current.srcObject = camStream;
      }
      setSetupStep("preview");
    } catch (e) {
      setError("Could not access camera/microphone/screen. Please allow permissions.");
    }
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    screenStreamRef.current = null;
  };

  const goLive = async () => {
    if (!streamTitle.trim()) { setError("Please enter a stream title."); return; }
    setError("");
    setIsLive(true);
    setSetupStep("live");

    // Store stream listing in DB
    const newListing = await base44.entities.Listing.create({
      seller_email: user.email,
      seller_username: profile?.username || user.full_name,
      title: streamTitle,
      description: `🔴 LIVE NOW — ${streamTitle}`,
      price: 0,
      category: "livestream",
      status: "active",
      is_approved: true,
    });
    setListing(newListing);

    // Timer
    const t = setInterval(() => setDuration(d => d + 1), 1000);
    setTimerRef(t);

    // Simulate viewer count growing
    const vInterval = setInterval(() => setViewers(v => v + Math.floor(Math.random() * 3)), 8000);
    return () => { clearInterval(t); clearInterval(vInterval); };
  };

  const endStream = async () => {
    setIsLive(false);
    setSetupStep("config");
    if (timerRef) clearInterval(timerRef);
    stopTracks();
    setDuration(0);
    setViewers(0);

    // Mark listing as sold/ended
    if (listing) {
      await base44.entities.Listing.update(listing.id, { status: "sold", description: `📼 Stream ended — ${streamTitle}` });
      setListing(null);
    }
    if (onClose) onClose();
  };

  useEffect(() => {
    return () => {
      stopTracks();
      if (timerRef) clearInterval(timerRef);
    };
  }, []);

  const formatDuration = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0 ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}` : `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !micOn; setMicOn(!micOn); }
  };

  const toggleCam = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !camOn; setCamOn(!camOn); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #080012, #030712)", border: "1px solid rgba(239,68,68,0.3)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-900/40 border border-red-700/50 flex items-center justify-center">
              <Radio className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-white font-black text-sm">GAMER Live Studio</h2>
              {isLive && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-bold">{formatDuration(duration)}</span>
                  <span className="text-gray-500 text-xs">· {viewers} viewers</span>
                </div>
              )}
            </div>
          </div>
          <button onClick={isLive ? endStream : (onClose || (() => {}))} className="text-gray-500 hover:text-white transition-colors text-sm">
            {isLive ? <span className="text-red-400 font-bold text-xs">END STREAM</span> : "✕"}
          </button>
        </div>

        <div className="p-6">
          {/* STEP 1: Config */}
          {setupStep === "config" && (
            <div className="space-y-5 max-w-xl mx-auto">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5 block">Stream Title *</label>
                <input value={streamTitle} onChange={e => setStreamTitle(e.target.value)}
                  placeholder="What are you streaming today?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm" />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Stream Source</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "camera", icon: Camera, label: "Camera Only", desc: "Webcam + mic" },
                    { id: "screen", icon: Monitor, label: "Screen Share", desc: "Share your PC screen" },
                    { id: "both", icon: Share2, label: "Screen + Camera", desc: "PiP overlay" },
                  ].map(m => (
                    <button key={m.id} onClick={() => setMode(m.id)}
                      className={`p-4 rounded-xl border text-center transition-all ${mode === m.id ? "bg-red-900/30 border-red-500/60 text-white" : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"}`}>
                      <m.icon className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-xs font-bold">{m.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{error}</p>}

              <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-200/70 text-xs">Only stream content you own or have rights to. No copyrighted music or protected game streams without permission.</p>
              </div>

              <button onClick={startPreview}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-black text-sm hover:opacity-90">
                Preview Stream →
              </button>
            </div>
          )}

          {/* STEP 2: Preview */}
          {setupStep === "preview" && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                {(mode === "camera" || mode === "both") && (
                  <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${mode === "both" ? "absolute inset-0" : ""}`} />
                )}
                {(mode === "screen" || mode === "both") && (
                  <video ref={screenRef} autoPlay muted playsInline className={`${mode === "both" ? "w-full h-full object-cover" : "w-full h-full object-contain"}`} />
                )}
                {mode === "both" && (
                  <video ref={videoRef} autoPlay muted playsInline className="absolute bottom-3 right-3 w-32 h-20 object-cover rounded-lg border-2 border-red-500/60" />
                )}
                {/* Preview label */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold">PREVIEW</div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button onClick={toggleMic}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${micOn ? "bg-gray-800 border border-gray-700 text-white" : "bg-red-900/40 border border-red-700/50 text-red-400"}`}>
                    {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    {micOn ? "Mic On" : "Mic Off"}
                  </button>
                  {(mode === "camera" || mode === "both") && (
                    <button onClick={toggleCam}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${camOn ? "bg-gray-800 border border-gray-700 text-white" : "bg-red-900/40 border border-red-700/50 text-red-400"}`}>
                      {camOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                      {camOn ? "Cam On" : "Cam Off"}
                    </button>
                  )}
                </div>
                <button onClick={() => { stopTracks(); setSetupStep("config"); }}
                  className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 text-xs">← Back</button>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button onClick={goLive}
                className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(90deg, #dc2626, #be123c)", boxShadow: "0 0 20px rgba(220,38,38,0.4)" }}>
                <Circle className="w-3 h-3 fill-white" />
                GO LIVE NOW
              </button>
            </div>
          )}

          {/* STEP 3: Live */}
          {setupStep === "live" && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: "16/9" }}>
                {(mode === "screen" || mode === "both") && (
                  <video ref={screenRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                )}
                {mode === "camera" && (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                )}
                {mode === "both" && (
                  <video ref={videoRef} autoPlay muted playsInline className="absolute bottom-3 right-3 w-32 h-20 object-cover rounded-lg border-2 border-red-500" />
                )}
                {/* LIVE badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-sm text-white"
                  style={{ background: "rgba(220,38,38,0.9)", boxShadow: "0 0 15px rgba(220,38,38,0.6)" }}>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-bold">
                  <Users className="w-3 h-3" /> {viewers}
                </div>
                <div className="absolute bottom-3 left-3 text-white text-xs font-bold bg-black/70 px-2 py-1 rounded-lg">{streamTitle}</div>
              </div>

              <div className="flex gap-3">
                <button onClick={toggleMic}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${micOn ? "bg-gray-800 border border-gray-700 text-white" : "bg-red-900/40 border border-red-700/50 text-red-400"}`}>
                  {micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                {(mode === "camera" || mode === "both") && (
                  <button onClick={toggleCam}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${camOn ? "bg-gray-800 border border-gray-700 text-white" : "bg-red-900/40 border border-red-700/50 text-red-400"}`}>
                    {camOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  </button>
                )}
                <div className="flex-1 text-center text-red-400 font-mono font-black text-xl flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {formatDuration(duration)}
                </div>
                <button onClick={endStream}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-900/40 border border-red-700/60 text-red-400 font-black text-sm hover:bg-red-900/60 transition-colors">
                  <Square className="w-3.5 h-3.5 fill-red-400" /> End Stream
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}