import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  X,
  ExternalLink,
  Loader2,
  Download,
} from "lucide-react";
import { extractVideoUrl } from "@/lib/videoThumbnail";
import { getOptimizedVideoUrl } from "@/lib/cloudinaryService";
import { suppressGhostClicks } from "@/lib/utils";
import { isDirectVideoUrl, downloadVideo } from "@/lib/imageDownloads";

// ─── Helpers ────────────────────────────────────────────────────────────────

function youtubId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function tiktokId(url: string): string | null {
  const m = url.match(/\/video\/(\d{6,})/);
  return m ? m[1] : null;
}

type Platform = "youtube" | "tiktok" | "direct" | "other";

function detectPlatform(url: string): Platform {
  if (!url) return "other";
  if (/youtu(be\.com|\.be)/i.test(url)) return "youtube";
  if (/(^|\.)tiktok\.com/i.test(url)) return "tiktok";
  if (isDirectVideoUrl(url)) {
    return "direct";
  }
  return "other";
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

// ─── Direct Custom Luxury Video Player (Autoplay & Natural Aspect Ratio) ────

interface CustomDirectPlayerProps {
  url: string;
  onClose: () => void;
  fileName?: string;
}

function CustomDirectPlayer({ url, onClose }: CustomDirectPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isVertical, setIsVertical] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<{
    side: "left" | "right";
    label: string;
  } | null>(null);

  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const doubleTapFeedbackTimer = useRef<NodeJS.Timeout | null>(null);

  const optimizedSrc = getOptimizedVideoUrl(url);

  // Auto-hide controls when playing
  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3200);
  }, []);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  // Attempt autoplay on mount
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          scheduleHideControls();
        })
        .catch(() => {
          // If browser policy prevents unmuted autoplay, try muted
          vid.muted = true;
          setIsMuted(true);
          vid.play().then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            scheduleHideControls();
          }).catch(() => {
            setIsLoading(false);
          });
        });
    }
  }, [scheduleHideControls]);

  // Toggle Play / Pause
  const togglePlay = useCallback((e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused || vid.ended) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Seek relative seconds (+10 or -10)
  const seekRelative = useCallback((seconds: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    const target = Math.max(0, Math.min(vid.duration || 0, vid.currentTime + seconds));
    vid.currentTime = target;
    setCurrentTime(target);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Double tap handler on video overlay
  const handleTouchOrClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = "touches" in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX;
    const relativeX = clientX - rect.left;
    const isRightSide = relativeX > rect.width / 2;

    const timeSinceLast = now - lastTapRef.current.time;
    const distSinceLast = Math.abs(clientX - lastTapRef.current.x);

    if (timeSinceLast < 320 && distSinceLast < 60) {
      // Double Tap detected!
      if (isRightSide) {
        seekRelative(10);
        showDoubleTapBadge("right", "+10 ثوانٍ");
      } else {
        seekRelative(-10);
        showDoubleTapBadge("left", "-10 ثوانٍ");
      }
      lastTapRef.current = { time: 0, x: 0 };
    } else {
      // Single tap: toggle controls
      lastTapRef.current = { time: now, x: clientX };
      setShowControls((prev) => !prev);
    }
  };

  const showDoubleTapBadge = (side: "left" | "right", label: string) => {
    if (doubleTapFeedbackTimer.current) clearTimeout(doubleTapFeedbackTimer.current);
    setDoubleTapFeedback({ side, label });
    doubleTapFeedbackTimer.current = setTimeout(() => {
      setDoubleTapFeedback(null);
    }, 850);
  };

  // Timeline Scrubbing / Dragging
  const handleScrub = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const vid = videoRef.current;
    const timeline = timelineRef.current;
    if (!vid || !timeline || !duration) return;

    const rect = timeline.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX;
    const clickPos = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const percent = clickPos / rect.width;
    const target = percent * duration;

    vid.currentTime = target;
    setCurrentTime(target);
    resetControlsTimeout();
  };

  // Toggle Mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
    resetControlsTimeout();
  };

  // Update buffer progress
  const updateBuffer = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    if (vid.buffered.length > 0) {
      setBuffered(vid.buffered.end(vid.buffered.length - 1));
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        seekRelative(5);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        seekRelative(-5);
      } else if (e.key === "m") {
        e.preventDefault();
        toggleMute({ stopPropagation: () => {} } as any);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, seekRelative, onClose]);

  // Clean timers
  useEffect(() => {
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      if (doubleTapFeedbackTimer.current) clearTimeout(doubleTapFeedbackTimer.current);
    };
  }, []);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onClick={handleTouchOrClick}
      style={
        isVertical && aspectRatio
          ? { aspectRatio: `${aspectRatio}` }
          : undefined
      }
      className={`relative bg-black rounded-2xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] border border-white/10 flex items-center justify-center cursor-pointer select-none group transition-all duration-300 ${
        isVertical
          ? "h-[85vh] sm:h-[88vh] w-auto max-w-[94vw]"
          : "w-full max-w-5xl max-h-[85vh] sm:max-h-[90vh] aspect-video"
      }`}
    >
      {/* HTML5 Native Video Tag with Autoplay */}
      <video
        ref={videoRef}
        src={optimizedSrc}
        autoPlay
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className="w-full h-full object-contain"
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            updateBuffer();
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            const w = videoRef.current.videoWidth;
            const h = videoRef.current.videoHeight;
            if (w > 0 && h > 0) {
              setAspectRatio(w / h);
              setIsVertical(h > w);
            }
            setDuration(videoRef.current.duration);
            setIsLoading(false);
            // Autoplay trigger
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => {
          setIsLoading(false);
          if (videoRef.current?.paused) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none z-20">
          <div className="w-14 h-14 rounded-full bg-black/70 border border-white/20 flex items-center justify-center shadow-2xl">
            <Loader2 className="w-7 h-7 text-[#C5A059] animate-spin" />
          </div>
        </div>
      )}

      {/* Big Center Play Indicator (Only shown when explicitly paused or ended) */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#C5A059] text-[#10202D] flex items-center justify-center shadow-[0_8px_32px_rgba(197,160,89,0.5)] border-2 border-white/40 transform transition-transform group-hover:scale-110">
            <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-current translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Double Tap Visual Feedback Badges */}
      {doubleTapFeedback && (
        <div
          className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-black/80 border border-white/20 text-white backdrop-blur-md animate-in zoom-in-75 duration-200 ${
            doubleTapFeedback.side === "right" ? "right-8 sm:right-16" : "left-8 sm:left-16"
          }`}
        >
          {doubleTapFeedback.side === "right" ? (
            <RotateCw className="w-6 h-6 text-[#C5A059] stroke-[2.5]" />
          ) : (
            <RotateCcw className="w-6 h-6 text-[#C5A059] stroke-[2.5]" />
          )}
          <span className="text-xs font-black tracking-wider text-white">
            {doubleTapFeedback.label}
          </span>
        </div>
      )}

      {/* ── Luxury Bottom Control Bar ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-0 bottom-0 z-30 pt-10 pb-3 px-3 sm:px-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 pointer-events-auto ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Scrubber / Progress Bar */}
        <div
          ref={timelineRef}
          onClick={handleScrub}
          className="relative w-full h-3 sm:h-3.5 flex items-center cursor-pointer group/bar mb-2.5 touch-none"
        >
          {/* Base track */}
          <div className="w-full h-1 sm:h-1.5 bg-white/25 rounded-full overflow-hidden transition-all group-hover/bar:h-2">
            {/* Buffer progress */}
            <div
              className="h-full bg-white/30 rounded-full transition-all duration-200"
              style={{ width: `${bufferPercent}%` }}
            />
          </div>

          {/* Played progress */}
          <div
            className="absolute left-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#C5A059] to-[#E3C78B] rounded-full transition-all group-hover/bar:h-2"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Scrubber Thumb */}
          <div
            className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white border-2 border-[#C5A059] shadow-lg -translate-x-1/2 transform scale-90 group-hover/bar:scale-125 transition-transform"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between text-white text-xs sm:text-sm">
          {/* Playback & Seek */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer"
              title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
              )}
            </button>

            {/* Rewind 10s */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                seekRelative(-10);
                showDoubleTapBadge("left", "-10 ثوانٍ");
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer"
              title="تأخير 10 ثوانٍ"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>

            {/* Forward 10s */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                seekRelative(10);
                showDoubleTapBadge("right", "+10 ثوانٍ");
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer"
              title="تقديم 10 ثوانٍ"
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </button>

            {/* Time Indicator */}
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-mono font-bold text-white/90 mr-1 tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/60">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Sound Mute Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all cursor-pointer"
              title={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── External Platform Players (YouTube / TikTok / Fallback) ────────────────

function YoutubePlayer({ url }: { url: string }) {
  const id = youtubId(url);
  if (!id) return <FallbackPlayer url={url} />;
  return (
    <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <iframe
        src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
        title="فيديو العقار"
        className="w-full h-full bg-black"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function TiktokPlayer({ url }: { url: string }) {
  const local = tiktokId(url);
  const [id, setId] = useState<string | null>(local);
  const [state, setState] = useState<"ready" | "loading" | "failed">(
    local ? "ready" : "loading"
  );

  useEffect(() => {
    const direct = tiktokId(url);
    if (direct) {
      setId(direct);
      setState("ready");
      return;
    }
    let cancelled = false;
    setId(null);
    setState("loading");
    fetch(`/api/tiktok/resolve?url=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { videoId?: string }) => {
        if (cancelled) return;
        if (data.videoId) {
          setId(data.videoId);
          setState("ready");
        } else setState("failed");
      })
      .catch(() => {
        if (!cancelled) setState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (state === "loading") {
    return (
      <div className="w-full max-w-[420px] flex items-center justify-center bg-black rounded-2xl p-12 border border-white/10" style={{ minHeight: 460 }}>
        <Loader2 className="h-10 w-10 text-[#C5A059] animate-spin" />
      </div>
    );
  }
  if (state === "ready" && id) {
    return (
      <div className="w-full max-w-[420px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10" style={{ minHeight: 520 }}>
        <iframe
          src={`https://www.tiktok.com/embed/v2/${id}`}
          title="فيديو العقار"
          className="w-full h-full bg-black"
          style={{ minHeight: 520 }}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }
  return <FallbackPlayer url={url} />;
}

function FallbackPlayer({ url }: { url: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 bg-[#161B20] text-center rounded-2xl border border-white/15 max-w-md w-full shadow-2xl">
      <div className="w-16 h-16 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 flex items-center justify-center">
        <Play className="h-7 w-7 text-[#C5A059] fill-[#C5A059]" />
      </div>
      <div>
        <p className="font-bold text-foreground text-base">فيديو خارجي للعقار</p>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          هذا الفيديو مستضاف على منصة خارجية، يمكنك مشاهدته مباشرة عبر الرابط أدناه.
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#B38E46] text-[#10202D] font-bold text-sm shadow-lg transition-all"
      >
        <ExternalLink className="h-4 w-4" />
        فتح ومشاهدة الفيديو
      </a>
    </div>
  );
}

// ─── Main Portal Modal ──────────────────────────────────────────────────────

export interface VideoPlayerModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  propertyTitle?: string;
  propertyCode?: string;
}

export function VideoPlayerModal({
  open,
  onClose,
  videoUrl,
  propertyTitle,
  propertyCode,
}: VideoPlayerModalProps) {
  const [downloading, setDownloading] = useState(false);

  if (!open || !videoUrl) return null;

  const url = extractVideoUrl(videoUrl);
  const platform = detectPlatform(url);
  const canDownload = isDirectVideoUrl(url);

  const handleClose = () => {
    suppressGhostClicks(450);
    onClose();
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canDownload || downloading) return;
    setDownloading(true);
    try {
      const fileName = propertyCode ? `فيديو_عقار_${propertyCode}` : (propertyTitle || "فيديو_عقار_العمودي");
      await downloadVideo(url, fileName);
    } catch (err) {
      console.error("Video download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] bg-black/92 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 select-none animate-in fade-in duration-200"
      style={{ touchAction: "manipulation" }}
      // CRITICAL: Backdrop click does NOTHING. The user never exits by mistake.
    >
      {/* ── Top Header Actions (Close X & Download Button) ── */}
      <div className="fixed top-4 inset-x-4 sm:top-6 sm:inset-x-6 z-[1000005] flex items-center justify-between pointer-events-none">
        {/* Isolated Close (X) Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/80 hover:bg-black text-white/90 hover:text-white flex items-center justify-center border border-white/25 shadow-2xl transition-all active:scale-90 cursor-pointer backdrop-blur-lg pointer-events-auto"
          aria-label="إغلاق الفيديو"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Video Download Button (Only visible for direct uploaded videos, NOT external links) */}
        {canDownload && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-3.5 py-2 rounded-full bg-black/80 hover:bg-black text-white/95 flex items-center gap-2 border border-white/25 shadow-2xl transition-all active:scale-95 cursor-pointer backdrop-blur-lg pointer-events-auto text-xs font-bold"
            title="تحميل الفيديو على جهازك"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
            ) : (
              <Download className="w-4 h-4 stroke-[2.5] text-[#C5A059]" />
            )}
            <span className="hidden sm:inline">تحميل الفيديو</span>
          </button>
        )}
      </div>

      {/* ── Video Player Core ── */}
      <div onClick={(e) => e.stopPropagation()} className="relative z-[1000001] w-full flex items-center justify-center">
        {platform === "direct" && (
          <CustomDirectPlayer
            url={url}
            onClose={handleClose}
            fileName={propertyCode || propertyTitle}
          />
        )}
        {platform === "youtube" && <YoutubePlayer url={url} />}
        {platform === "tiktok" && <TiktokPlayer url={url} />}
        {platform === "other" && <FallbackPlayer url={url} />}
      </div>
    </div>,
    document.body
  );
}
