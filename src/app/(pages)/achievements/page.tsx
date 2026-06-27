"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/store";
import RoadmapApiAxiosInstance from "@/app/api/axiosInstance";
import { apiRoutes } from "@/app/api/apiRoutes";
import UnauthorizedPage from "@/app/components/Auth/UnauthorizedPage";
import {
  Award, Trophy, Flame, Lock, CheckCircle2,
  TrendingUp, ChevronUp, Zap, Sparkles,
} from "lucide-react";

interface AchievementDef {
  _id: string;
  title: string;
  description: string;
  image: string;
}

const ACHIEVEMENT_MILESTONES = [
  { key: "fast-learner",   label: "Fast Learner",          desc: "Complete 5 quizzes.",                  target: 5  },
  { key: "problem-solver", label: "Master Problem Solver",  desc: "Pass 10 quizzes.",                     target: 10 },
  { key: "roadmap-master", label: "Roadmap Master",         desc: "Complete 3 full roadmaps.",            target: 3  },
];

export default function AchievementsPage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [profile,      setProfile]      = useState<any>(null);
  const [allAchievements, setAllAchievements] = useState<AchievementDef[]>([]);
  const [streak,       setStreak]       = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) { setLoading(false); return; }
    const fetch = async () => {
      try {
        // 1. Fetch user profile (includes user.achievements[] and streak)
        const [profileRes, achRes] = await Promise.all([
          RoadmapApiAxiosInstance.get(apiRoutes.Users.getProfile.route),
          RoadmapApiAxiosInstance.get(apiRoutes.Achievement.getAll.route),
        ]);
        if (profileRes.data?.success) {
          setProfile(profileRes.data.user);
          setStreak(profileRes.data.streak?.current ?? 0);
        }
        if (achRes.data?.success) {
          setAllAchievements(achRes.data.achievements ?? []);
        }
      } catch { /* non-critical */ } finally { setLoading(false); }
    };
    fetch();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return <UnauthorizedPage mode="authenticate" />;

  const quizProgress    = profile?.progressData?.quiz    ?? [];
  const roadmapProgress = profile?.progressData?.roadmap ?? [];
  const passedCount     = quizProgress.filter((q: any) => q.status === "Pass" || q.status === "Passed").length;

  // User's earned achievement IDs from profile
  const earnedIds = new Set(
    (profile?.achievements ?? []).map((a: any) =>
      typeof a === "string" ? a : (a.achievement?._id ?? a._id ?? a)
    )
  );

  const completedRoadmaps = roadmapProgress.filter((r: any) => {
    const total = typeof r.numberOfAllSections === "number" ? r.numberOfAllSections : 0;
    return total > 0 && r.completedSections.length >= total;
  }).length;

  const recentActivity = quizProgress.slice(0, 3).map((q: any, i: number) => {
    const quizObj = typeof q.quiz === "object" ? q.quiz : null;
    const title   = quizObj?.title || "a quiz";
    return { text: `Completed "${title}"`, time: i === 0 ? "Today" : i === 1 ? "Yesterday" : "2 days ago" };
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>›</span>
          <span className="text-primary font-medium">Achievements</span>
        </nav>

        {/* Stat cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          <div className="rounded-2xl bg-primary text-white p-5">
            <p className="text-sm text-white/80 mb-1">Total Badges Earned</p>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-bold">{String(earnedIds.size).padStart(2,"0")}</p>
              <Award size={32} className="text-white/50" />
            </div>
          </div>
          <div className="rounded-2xl bg-muted border border-border p-5">
            <p className="text-sm text-muted-foreground mb-1">Quizzes Passed</p>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-bold text-foreground">{passedCount}/{quizProgress.length || "—"}</p>
              <Trophy size={32} className="text-muted-foreground/40" />
            </div>
          </div>
          <div className="rounded-2xl bg-orange-500 text-white p-5">
            <p className="text-sm text-white/80 mb-1">Current Learning Streak</p>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-bold">{streak} <span className="text-xl font-medium">{streak === 1 ? "day" : "days"}</span></p>
              <Flame size={32} className="text-white/50" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-8">

            {/* Badges Gallery — real data from GET /api/v1/achievement */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">Badges Gallery</h2>
              </div>

              {allAchievements.length === 0 && !loading ? (
                <div className="devmap-card text-center py-10">
                  <Award size={32} className="text-muted-foreground mx-auto mb-3" />
                  <p className="font-semibold text-foreground mb-1">No Badges Available</p>
                  <p className="text-sm text-muted-foreground">Check back later for badges to earn.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allAchievements.map((ach) => {
                    const earned = earnedIds.has(ach._id);
                    return (
                      <div key={ach._id} className={`devmap-card text-center transition-all ${!earned ? "opacity-60 border-dashed" : "hover:border-primary/30"}`}>
                        <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-border bg-muted flex items-center justify-center">
                          {ach.image ? (
                            <Image src={ach.image} alt={ach.title} width={64} height={64} className="w-full h-full object-cover" />
                          ) : earned ? (
                            <Award size={28} className="text-primary" />
                          ) : (
                            <Lock size={24} className="text-muted-foreground" />
                          )}
                        </div>
                        <p className="font-bold text-sm text-foreground mb-1">{ach.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{ach.description}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                          earned
                            ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {earned ? <><CheckCircle2 size={9} /> Earned</> : <><Lock size={9} /> Locked</>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Progress milestones */}
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Progress Milestones</h2>
              <div className="space-y-3">
                {ACHIEVEMENT_MILESTONES.map((m) => {
                  const current = m.key === "roadmap-master" ? completedRoadmaps : passedCount;
                  const progress = Math.min(current, m.target);
                  const pct  = Math.round((progress / m.target) * 100);
                  const done = progress >= m.target;
                  return (
                    <div key={m.key} className="devmap-card">
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-green-100 dark:bg-green-950/30 text-green-600" : "bg-muted text-muted-foreground"}`}>
                          <Sparkles size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-sm text-foreground">{m.label}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{progress}/{m.target}</span>
                              {done && <CheckCircle2 size={14} className="text-green-500" />}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{m.desc}</p>
                          <div className="devmap-progress">
                            <div className={`devmap-progress-fill ${done ? "!bg-green-500" : ""}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            <div className="devmap-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-primary" />
                <h3 className="font-bold text-foreground">Rankings</h3>
              </div>
              <div className="space-y-2">
                {[
                  { rank: "01", name: "Sarah Chen",              pts: "4,250", you: false },
                  { rank: "14", name: profile?.username ?? "You",pts: `${passedCount * 180 + 1000}`, you: true },
                  { rank: "15", name: "Jordan Smith",            pts: "2,790", you: false },
                ].map((entry) => (
                  <div key={entry.rank} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${entry.you ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"}`}>
                    <span className={`text-sm font-bold w-6 shrink-0 ${entry.you ? "text-primary" : "text-muted-foreground"}`}>{entry.rank}</span>
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{entry.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${entry.you ? "text-primary" : "text-foreground"}`}>{entry.you ? `You (${entry.name})` : entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.pts} pts</p>
                    </div>
                    {entry.you && <ChevronUp size={14} className="text-primary shrink-0" />}
                    {!entry.you && entry.rank === "01" && <Award size={14} className="text-amber-500 shrink-0" />}
                  </div>
                ))}
              </div>
              <button className="btn-secondary w-full mt-4 py-2 rounded-xl text-sm justify-center">Full Leaderboard</button>
            </div>

            <div className="devmap-card">
              <h3 className="font-bold text-sm text-foreground mb-4 uppercase tracking-wide">Recent Activity</h3>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Complete a quiz to see your activity.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((act: {text: string; time: string}, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={15} className="text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground leading-snug">{act.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
