import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Crop, RotateCw, Layers, Plus, Video, Image, Music,
  Type, Wand2, Mic, Download, Share2, Settings, Play, Pause,
  Volume2, VolumeX, Undo2, Redo, Trash2, Copy, ZoomIn, ZoomOut,
  Grid3X3, LayoutGrid, Film, Palette, Globe,
  Sparkles, Eraser, Wand, MessageSquare, Subtitles, Maximize, Minimize,
  FlipHorizontal, FlipVertical, Sun, Contrast, Aperture, Eye,
  EyeOff, Lock, Unlock, FolderOpen, Save, Clock,
  BarChart3, Hash, QrCode, FileVideo, FileImage, FileAudio,
  FileText, CheckCircle2, AlertCircle, Info, ChevronRight, ChevronDown,
  MoreVertical, X, Search, Filter, SortAsc,
  Upload, Cloud, RefreshCw, Check, ArrowLeft,
  Menu, Home, User, Star, Heart, Bookmark, Tag, Folder,
  Video as VideoIcon, Music as MusicIcon, Type as TypeIcon, Palette as PaletteIcon
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import AuthNavbar from "@/components/layout/AuthNavbar";
import VideoTimeline from "@/components/video-studio/VideoTimeline";
import MediaLibrary from "@/components/video-studio/MediaLibrary";
import TextEditor from "@/components/video-studio/TextEditor";
import AudioEditor from "@/components/video-studio/AudioEditor";
import AIAssistant from "@/components/video-studio/AIAssistant";
import ExportPanel from "@/components/video-studio/ExportPanel";
import PropertiesPanel from "@/components/video-studio/PropertiesPanel";
import Toolbar from "@/components/video-studio/Toolbar";
import Canvas from "@/components/video-studio/Canvas";
import TemplatesPanel from "@/components/video-studio/TemplatesPanel";

export default function AIVideoStudioPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Project state
  const [currentProject, setCurrentProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Canvas state
  const [selectedElement, setSelectedElement] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState("select");

  // Panels state
  const [activePanel, setActivePanel] = useState("media");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);

  // Timeline state
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [playheadPosition, setPlayheadPosition] = useState(0);

  // AI state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        if (!me) {
          base44.auth.redirectToLogin("/ai-video-studio");
          return;
        }
        setUser(me);
        const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
        if (profiles.length > 0) setProfile(profiles[0]);
        
        const userProjects = await base44.entities.VideoPost.filter({ creator_email: me.email });
        setProjects(userProjects);
        
        setLoading(false);
      } catch (error) {
        console.error("Init error:", error);
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleCreateProject = async (template = null) => {
    const newProject = {
      creator_email: user.email,
      creator_username: profile?.username || user.full_name,
      creator_avatar: profile?.avatar_url || "",
      title: template?.name || "Untitled Project",
      description: "",
      canvas_size: canvasSize,
      tracks: [],
      elements: [],
      duration: 30,
      created_date: new Date().toISOString(),
      status: "draft",
    };
    
    const created = await base44.entities.VideoPost.create(newProject);
    setCurrentProject(created);
    setTracks([]);
  };

  const handleSaveProject = async () => {
    if (!currentProject) return;
    await base44.entities.VideoPost.update(currentProject.id, {
      ...currentProject,
      tracks,
      elements: tracks.flatMap(t => t.elements || []),
      updated_date: new Date().toISOString(),
    });
  };

  const handleExport = async (format, quality) => {
    console.log("Exporting:", format, quality);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <AuthNavbar user={user} profile={profile} />
      
      {/* Top Bar */}
      <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 mt-16">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentProject(null)} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <input
            value={currentProject?.title || ""}
            onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
            className="bg-transparent text-white font-semibold focus:outline-none"
            placeholder="Project Name"
          />
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-800 rounded">{canvasSize.width}x{canvasSize.height}</span>
            <span className="px-2 py-1 bg-gray-800 rounded">{duration}s</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handleSaveProject} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white">
            <Save className="w-4 h-4" />
            Save
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={() => setActivePanel("export")}
            className="flex items-center gap-2 px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tools & Media */}
        <AnimatePresence>
          {showLeftPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-900 border-r border-gray-800 flex flex-col"
            >
              {/* Tool Categories */}
              <div className="p-3 border-b border-gray-800">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "media", icon: Image, label: "Media" },
                    { id: "text", icon: Type, label: "Text" },
                    { id: "audio", icon: Music, label: "Audio" },
                    { id: "ai", icon: Sparkles, label: "AI" },
                    { id: "templates", icon: LayoutGrid, label: "Templates" },
                    { id: "elements", icon: Grid3X3, label: "Elements" },
                    { id: "effects", icon: Wand2, label: "Effects" },
                    { id: "export", icon: Download, label: "Export" },
                  ].map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => setActivePanel(tool.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                        activePanel === tool.id
                          ? "bg-purple-600/20 text-purple-400"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <tool.icon className="w-5 h-5" />
                      <span className="text-[10px]">{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto">
                {activePanel === "media" && <MediaLibrary />}
                {activePanel === "text" && <TextEditor />}
                {activePanel === "audio" && <AudioEditor />}
                {activePanel === "ai" && (
                  <AIAssistant
                    prompt={aiPrompt}
                    setPrompt={setAiPrompt}
                    isGenerating={isGenerating}
                    onGenerate={() => {}}
                  />
                )}
                {activePanel === "templates" && <TemplatesPanel onSelect={handleCreateProject} />}
                {activePanel === "export" && (
                  <ExportPanel
                    onExport={handleExport}
                    project={currentProject}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center - Canvas & Preview */}
        <div className="flex-1 flex flex-col bg-gray-950">
          {/* Toolbar */}
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            zoom={zoom}
            setZoom={setZoom}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            setIsMuted={setIsMuted}
          />

          {/* Canvas Area */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
            <Canvas
              project={currentProject}
              tracks={tracks}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              canvasSize={canvasSize}
              zoom={zoom}
              currentTime={currentTime}
              isPlaying={isPlaying}
            />
          </div>

          {/* Timeline */}
          {showTimeline && (
            <VideoTimeline
              tracks={tracks}
              setTracks={setTracks}
              playheadPosition={playheadPosition}
              setPlayheadPosition={setPlayheadPosition}
              duration={duration}
              selectedTrack={selectedTrack}
              setSelectedTrack={setSelectedTrack}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
          )}
        </div>

        {/* Right Panel - Properties */}
        <AnimatePresence>
          {showRightPanel && selectedElement && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-900 border-l border-gray-800 overflow-y-auto"
            >
              <PropertiesPanel
                element={selectedElement}
                onUpdate={(updates) => {}}
                onDelete={() => {}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}