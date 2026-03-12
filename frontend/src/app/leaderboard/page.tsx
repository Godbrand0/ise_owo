"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { fetchAllTasks } from "@/lib/contract";
import { formatSTX, truncateAddress } from "@/lib/utils";
import { Award, Medal, Share2, Trophy, User, Zap } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

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

      // Derive builders from completed/approved tasks on-chain
      const builderStats: Record<string, any> = {};
      allTasks.forEach((task: any) => {
        if (task.assignee && (Number(task.status) === 4 || Number(task.status) === 5)) {
          const addr = task.assignee;
          if (!builderStats[addr]) {
            builderStats[addr] = { address: addr, earned: 0, completed: 0 };
          }
          builderStats[addr].earned += Number(task.fundingAmount);
          builderStats[addr].completed += 1;
        }
      });

      const completedCount = allTasks.filter(
        (t: any) => Number(t.status) === 4 || Number(t.status) === 5
      ).length;

      const list = Object.values(builderStats).sort((a: any, b: any) => b.earned - a.earned);
      setBuilders(list);
      setStats({
        totalBounties: completedCount,
        activeBuilders: list.length,
        globalPoolStx: leaderboardRes.leaderboardStxPool
          ? Number(leaderboardRes.leaderboardStxPool) / 1e6
          : 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="pt-32 px-4 mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-600/10 mb-6">
             <Trophy className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight">The Builder Hall of Fame</h1>
          <p className="text-zinc-400 mt-4 text-xl">Top builders turning code into STX.</p>
        </div>

        {isLoading ? (
           <div className="space-y-4">
              {[1, 2, 3].map(i => (
                 <div key={i} className="h-20 rounded-2xl bg-zinc-900 animate-pulse border border-zinc-800" />
              ))}
           </div>
        ) : builders.length > 0 ? (
          <div className="space-y-4">
            {builders.map((builder, idx) => (
              <motion.div
                key={builder.address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-zinc-800 hover:border-orange-600/50 transition-colors">
                  <div className="flex items-center p-6 justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg
                        ${idx === 0 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/20" : 
                          idx === 1 ? "bg-zinc-300/20 text-zinc-300 border border-zinc-300/20" : 
                          idx === 2 ? "bg-orange-800/20 text-orange-800 border border-orange-800/20" : 
                          "bg-zinc-900 text-zinc-500"}`}
                      >
                         #{idx + 1}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                           <User className="h-5 w-5 text-zinc-500" />
                        </div>
                        <div>
                          <p className="font-mono text-lg font-bold">{truncateAddress(builder.address)}</p>
                          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Verified Builder</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-8">
                       <div className="hidden sm:block">
                          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Tasks</p>
                          <p className="font-bold text-zinc-200">{builder.completed}</p>
                       </div>
                       <div>
                          <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Total Earned</p>
                          <p className="font-bold text-orange-500 text-xl">{formatSTX(builder.earned)} STX</p>
                       </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10">
            <Medal className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold">No data yet</h3>
            <p className="text-zinc-500 mt-2">Earn rewards by completing tasks to show up here!</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <Card className="bg-blue-600/5 border-blue-600/20">
               <CardHeader className="pb-2">
                  <Medal className="h-5 w-5 text-blue-500 mb-2" />
                  <CardTitle className="text-sm uppercase tracking-widest text-blue-500">Global Pool</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-3xl font-bold">{stats.globalPoolStx.toLocaleString()} <span className="text-lg">STX</span></p>
                  <p className="text-xs text-zinc-500 mt-2">Ready to be distributed</p>
               </CardContent>
            </Card>
            <Card className="bg-purple-600/5 border-purple-600/20">
               <CardHeader className="pb-2">
                  <Award className="h-5 w-5 text-purple-500 mb-2" />
                  <CardTitle className="text-sm uppercase tracking-widest text-purple-500">Total Bounties</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-3xl font-bold">{stats.totalBounties}</p>
                  <p className="text-xs text-zinc-500 mt-2">Tasks completed on Taskify</p>
               </CardContent>
            </Card>
            <Card className="bg-orange-600/5 border-orange-600/20">
               <CardHeader className="pb-2">
                  <Zap className="h-5 w-5 text-orange-500 mb-2" />
                  <CardTitle className="text-sm uppercase tracking-widest text-orange-500">Active Builders</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-3xl font-bold">{stats.activeBuilders}</p>
                  <p className="text-xs text-zinc-500 mt-2">Unique builders with completions</p>
               </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
