"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { fetchAllTasks } from "@/lib/contract";
import { formatSTX, truncateAddress } from "@/lib/utils";
import { Trophy, Users, BarChart, ExternalLink, ArrowUpRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Link from "next/link"; // Added for the new JSX structure

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

interface Stats {
  totalBounties: number;
  activeBuilders: number;
  globalPoolStx: number;
}

export default function LeaderboardPage() {
  const [builders, setBuilders] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({ totalBounties: 0, activeBuilders: 0, globalPoolStx: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allTasks, leaderboardRes] = await Promise.all([
        fetchAllTasks(),
        fetch(`${BACKEND_URL}/api/leaderboard`).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);
      
      // Calculate basic stats
      const totalBounties = allTasks.length;
      const activeBuilders = new Set(allTasks.filter((t: any) => t.assignee).map((t: any) => t.assignee)).size;
      const globalPool = allTasks.reduce((acc: number, t: any) => acc + Number(t.fundingAmount), 0);

      setStats({
        totalBounties,
        activeBuilders,
        globalPoolStx: globalPool,
      });

      // Format leaders
      if (leaderboardRes.length > 0) {
        setBuilders(leaderboardRes);
      } else {
        // Derive from allTasks if backend is empty
        const contributors: Record<string, any> = {};
        allTasks.forEach((t: any) => {
          if (t.assignee) {
            if (!contributors[t.assignee]) contributors[t.assignee] = { address: t.assignee, score: 0, tasks_completed: 0 };
            if (t.status === 5) {
              contributors[t.assignee].tasks_completed += 1;
              contributors[t.assignee].score += 100;
            }
          }
        });
        setBuilders(Object.values(contributors).sort((a, b) => b.score - a.score));
      }

    } catch (e) {
      console.error("Error loading leaderboard:", e);
      setBuilders([]);
      setStats({ totalBounties: 0, activeBuilders: 0, globalPoolStx: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="pt-32 px-4 mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold tracking-tight mb-4">The Arena</h1>
            <p className="text-zinc-400 max-w-md mx-auto">Tracking the top contributors building the future of Bitcoin layers.</p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { label: "Total Bounties", value: stats.totalBounties, icon: Trophy, color: "text-orange-500" },
              { label: "Active Builders", value: stats.activeBuilders, icon: Users, color: "text-blue-500" },
              { label: "Global Pool", value: `${formatSTX(stats.globalPoolStx)} STX`, icon: BarChart, color: "text-green-500" },
            ].map((s, i) => (
              <Card key={i} className="bg-zinc-950/50 border-zinc-800 p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{s.label}</p>
                  <p className="text-2xl font-black">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-20`} />
              </Card>
            ))}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden">
            <div className="p-8 border-b border-zinc-900 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-500" /> Top Builders
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-zinc-900 animate-pulse" />
                ))}
              </div>
            ) : builders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900/50">
                      <th className="p-6">Rank</th>
                      <th className="p-6">Builder</th>
                      <th className="p-6">Quests</th>
                      <th className="p-6 text-right">Reputation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50">
                    {builders.map((builder, idx) => (
                      <tr key={builder.address} className="group hover:bg-zinc-900/30 transition-colors">
                        <td className="p-6 font-mono text-zinc-500">
                          {idx + 1 === 1 ? "🥇" : idx + 1 === 2 ? "🥈" : idx + 1 === 3 ? "🥉" : `#${idx + 1}`}
                        </td>
                        <td className="p-6">
                          <Link href={`/profile/${builder.address}`} className="flex items-center gap-3 hover:text-orange-500 transition-colors">
                             <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs">
                                {builder.username?.substring(0, 2) || "U"}
                             </div>
                             <span className="font-bold">{builder.username || truncateAddress(builder.address)}</span>
                          </Link>
                        </td>
                        <td className="p-6">
                           <span className="text-zinc-400 font-mono">{builder.tasks_completed || builder.completed || 0}</span>
                        </td>
                        <td className="p-6 text-right">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 font-black text-sm">
                            {builder.score || builder.current_score || 0}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center">
                 <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 mb-6">
                    <Search className="h-8 w-8 text-zinc-700" />
                 </div>
                 <p className="text-zinc-500 font-medium">The arena is quiet... for now.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
