"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import RoadmapApiAxiosInstance from "@/app/api/axiosInstance";
import { apiRoutes } from "@/app/api/apiRoutes";
import toast from "react-hot-toast";
import ProfileDetailsLoading from "@/app/components/Profile/ProfileDetailsLoading";
import Image from "next/image";
import UnauthorizedPage from "@/app/components/Auth/UnauthorizedPage";
import {
  Flame, Zap, Trophy, Grid3x3, Braces, Terminal,
  ChevronRight, CheckCircle2, Sparkles, BookOpen, Award,
} from "lucide-react";
import Link from "next/link";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const TOP_BADGE_DEFS = [
  { icon: Grid3x3,  label: "Grid Master",    desc: "Mastered CSS Grid layouts",       color: "bg-blue-100 dark:bg-blue-950/30 text-blue-600"    },
  { icon: Braces,   label: "HTML Architect", desc: "100% semantic score on projects", color: "bg-purple-100 dark:bg-purple-950/30 text-purple-600" },
  { icon: Terminal, label: "CLI Ninja",      desc: "Advanced terminal usage",          color: "bg-green-100 dark:bg-green-950/30 text-green-600"  },
];

interface RoadmapInfo {
  _id: string;
  title: string;
  description?: string;
  imageURL?: string;
  image?: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [profile,  setProfile]   = useState<any>(null);
  const [streak,   setStreak]    = useState(0);
  const [roadmapInfoMap, setRoadmapInfoMap] = useState<Record<string, RoadmapInfo>>({});
  const [loading,  setLoading]   = useState(true);

  useEffect(() => {
    if (!user || !isAuthenticated) { setLoading(false); return; }

    const load = async () => {
      try {
        // 1. Fetch profile — gets streak.current and progressData
        const res = await RoadmapApiAxiosInstance.get(apiRoutes.Users.getProfile.route);
        if (res.data?.success) {
          setProfile(res.data.user);
          // Real streak from server
          setStreak(res.data.streak?.current ?? 0);

          // 2. Fetch roadmap titles for each progressData.roadmap entry
          // progressData.roadmap[].roadmap is a raw ObjectId — NOT populated
          const roadmapIds: string[] = (res.data.user?.progressData?.roadmap ?? [])
            .map((r: any) => {
              const val = r.roadmap;
              return typeof val === "string" ? val : val?._id ?? val?.toString();
            })
            .filter(Boolean);

          if (roadmapIds.length > 0) {
            const results = await Promise.allSettled(
              roadmapIds.map((id: string) =>
                RoadmapApiAxiosInstance.get(apiRoutes.Roadmap.getRoadmapById.route(id))
              )
            );
            const map: Record<string, RoadmapInfo> = {};
            results.forEach((result, i) => {
              if (result.status === "fulfilled" && result.value.data?.success) {
                const rm = result.value.data.roadmap;
                map[roadmapIds[i]] = {
                  _id:         rm._id,
                  title:       rm.title,
                  description: rm.description,
                  imageURL:    rm.imageURL || rm.image,
                };
              }
            });
            setRoadmapInfoMap(map);
          }
        } else {
          toast.error(res.data?.message);
        }
      } finally { setLoading(false); }
    };
    load();
  }, [user, isAuthenticated]);

  if (loading)          return <ProfileDetailsLoading />;
  if (!isAuthenticated) return <UnauthorizedPage mode="authenticate" />;

  const roadmapProgress = profile?.progressData?.roadmap ?? [];
  const quizProgress    = profile?.progressData?.quiz    ?? [];
  const passedCount     = quizProgress.filter((q: any) => q.status === "Pass" || q.status === "Passed").length;
  const xp              = passedCount * 850 + 1200;
  const rank            = Math.max(1, 50 - passedCount * 3);

  // Get roadmap ID string from a progress entry (field is raw ObjectId string)
  const getRoadmapId = (r: any): string => {
    const val = r.roadmap;
    if (typeof val === "string") return val;
    return val?._id?.toString() ?? val?.toString() ?? "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <ChevronRight size={12} />
          <span className="text-primary font-medium">Profile</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Main column ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero card */}
            <div className="devmap-card">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] border-primary">
                    <Image src={profile?.imageURL || DEFAULT_AVATAR} alt={profile?.username || "Profile"}
                      width={96} height={96} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-foreground">{profile?.username || "User"}</h1>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-lg">
                    {profile?.bio || "No Bio Yet"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-500 text-white">
                      <Flame size={12} /> {streak} {streak === 1 ? "day" : "days"} streak
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500 text-white">
                      <Zap size={12} /> {xp.toLocaleString()} XP
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500 text-white">
                      <Trophy size={12} /> Rank #{rank}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Roadmaps */}
            <div className="devmap-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Active Roadmaps</h2>
                <Link href="/roadmap" className="text-sm font-medium text-primary hover:underline">View All</Link>
              </div>
              {roadmapProgress.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen size={28} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No active roadmaps yet.</p>
                  <Link href="/roadmap" className="btn-primary text-xs px-4 py-2 rounded-lg mt-3 inline-flex">Browse Roadmaps</Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {roadmapProgress.slice(0, 2).map((r: any, i: number) => {
                    const id    = getRoadmapId(r);
                    const info  = roadmapInfoMap[id];
                    // Use fetched title — falls back to "Loading..." briefly, never shows ID
                    const title = info?.title || (loading ? "Loading..." : `Roadmap ${i + 1}`);
                    const desc  = info?.description || "";
                    const imgURL= info?.imageURL || info?.image;
                    const total = typeof r.numberOfAllSections === "number" ? r.numberOfAllSections : 0;
                    const pct   = total ? Math.round((r.completedSections.length / total) * 100) : 0;
                    const statusColors = ["text-green-600 bg-green-100 dark:bg-green-950/30","text-amber-600 bg-amber-100 dark:bg-amber-950/30"];
                    const statuses     = ["On Track", "Picking Up Speed"];
                    return (
                      <div key={id || i} className="rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors">
                        {imgURL && (
                          <div className="h-24 bg-muted relative overflow-hidden">
                            <Image src={imgURL} alt={title} fill sizes="300px" className="object-cover" />
                          </div>
                        )}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">ROADMAP</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[i % 2]}`}>
                              {statuses[i % 2]}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{title}</p>
                            {desc && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{desc}</p>}
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{pct}% Complete</span>
                              <span className="text-muted-foreground">{r.completedSections.length}/{total} Sections</span>
                            </div>
                            <div className="devmap-progress">
                              <div className="devmap-progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <Link href={id ? `/roadmap/${id}` : "/roadmap"}
                            className="btn-secondary w-full justify-center text-xs py-2 rounded-lg">
                            Continue Learning
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* About */}
            <div className="devmap-card">
              <h2 className="text-lg font-bold text-foreground mb-3">
                About {profile?.username?.split(" ")[0] || "You"}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile?.bio || "No bio yet. Visit Settings to add one."}
              </p>
            </div>
          </div>

          {/* ── Right sidebar ───────────────────────────────────── */}
          <div className="space-y-5">
            {/* AI Insight */}
            <div className="rounded-2xl bg-primary p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={15} className="text-white/80" />
                <span className="text-xs font-bold uppercase tracking-wide text-white/80">AI Insight</span>
              </div>
              <p className="text-sm leading-relaxed mb-4 text-white/90">
                &ldquo;Keep up your streak! Tackle your next roadmap milestone to level up your skills.&rdquo;
              </p>
              <button className="w-full bg-white text-primary text-xs font-semibold py-2.5 rounded-xl hover:bg-white/90 transition-colors">
                View Recommendations
              </button>
            </div>

            {/* Top Badges — from API user.achievements */}
            <div className="devmap-card">
              <h3 className="font-bold text-foreground mb-3">Top Badges</h3>
              {(!profile?.achievements || profile.achievements.length === 0) ? (
                <div className="space-y-3">
                  {TOP_BADGE_DEFS.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <div key={badge.label} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors opacity-50">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${badge.color}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{badge.label}</p>
                          <p className="text-xs text-muted-foreground">{badge.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground text-center pt-1">Complete roadmaps to earn badges</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.achievements.slice(0, 3).map((a: any, i: number) => {
                    const achData = a.achievement ?? a;
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {achData?.image ? (
                            <Image src={achData.image} alt={achData.title || "Badge"} width={36} height={36} className="w-full h-full object-cover" />
                          ) : (
                            <Award size={16} className="text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{achData?.title || "Badge"}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{achData?.description || ""}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
