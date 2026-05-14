"use client";

import { use, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { useStacks } from "@/context/StacksContext";
import { truncateAddress, formatSTX, cn } from "@/lib/utils";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { 
  User, 
  CheckCircle2, 
  LayoutGrid, 
  Zap, 
  Briefcase, 
  Trophy, 
  ArrowUpRight, 
  Github,
  Wallet,
  ShieldCheck,
  Send
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const { address: connectedAddress, isConnected } = useStacks();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // Fetch from backend API which has the full DB record (including role and off-chain stats)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
      const response = await fetch(`${backendUrl}/api/users/${address}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        // Fallback: Fetch basic info from on-chain if not in backend yet
        console.warn("User not found in backend DB, trying on-chain fallback...");
        const { fetchCallReadOnlyFunction, cvToJSON, principalCV } = await import("@stacks/transactions");
        const { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } = await import("@/lib/constants");
        
        const result = await fetchCallReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: "get-user",
          functionArgs: [principalCV(address)],
          network: NETWORK,
          senderAddress: CONTRACT_ADDRESS,
        });
        
        const data = cvToJSON(result);
        if (data.value) {
          const flattened = Object.entries(data.value.value).reduce((acc: any, [key, val]: [string, any]) => {
            acc[key] = val.value !== undefined ? val.value : val;
            return acc;
          }, {});
          
          // Map on-chain keys to expected profile keys
          setProfile({
            address,
            username: flattened.username,
            tasks_created: Number(flattened["tasks-created"]),
            tasks_completed: Number(flattened["tasks-completed"]),
            total_stx_funded: flattened["total-funded"],
            total_stx_earned: flattened["total-earned"],
          });
        }
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [address]);

  const StatCard = ({ icon: Icon, label, value, color, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="relative overflow-hidden border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl p-6 group hover:border-zinc-700/50 transition-all duration-300">
        <div className={cn(
          "absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity",
          color === "orange" && "bg-orange-600",
          color === "blue" && "bg-blue-600",
          color === "green" && "bg-green-600",
          color === "purple" && "bg-purple-600",
          color === "cyan" && "bg-cyan-600",
          color === "rose" && "bg-rose-600",
        )} />
        
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center",
            color === "orange" && "bg-orange-500/10 text-orange-500",
            color === "blue" && "bg-blue-500/10 text-blue-500",
            color === "green" && "bg-green-500/10 text-green-500",
            color === "purple" && "bg-purple-500/10 text-purple-500",
            color === "cyan" && "bg-cyan-500/10 text-cyan-500",
            color === "rose" && "bg-rose-500/10 text-rose-500",
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-3xl font-black text-white tracking-tight">{value}</p>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{label}</p>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-500/30">
      <Navbar />
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <main className="pt-32 pb-20 px-4 mx-auto max-w-6xl">
        {/* Profile Header */}
        <div className="mb-16">
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-8"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-orange-600 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative h-32 w-32 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center shadow-2xl overflow-hidden">
                <User className="h-16 w-16 text-zinc-400" />
              </div>
              <div className="absolute bottom-1 right-1 h-8 w-8 bg-green-500 border-4 border-zinc-950 rounded-full shadow-lg" title="Active" />
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <h1 className="text-4xl font-black tracking-tighter">
                    {profile?.username || truncateAddress(address)}
                  </h1>
                  {profile?.role && (
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                      {profile.role}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-4 text-zinc-500">
                  <div className="flex items-center gap-1.5 font-mono text-sm bg-zinc-900/50 px-3 py-1 rounded-lg border border-zinc-800/50">
                    <Wallet className="h-3.5 w-3.5" />
                    {truncateAddress(address)}
                  </div>
                  {profile?.github_username && (
                    <Link 
                      href={`https://github.com/${profile.github_username}`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-sm hover:text-white transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      {profile.github_username}
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {isConnected && connectedAddress === address && (
              <div className="flex gap-3">
                <Link href={`/profile/${address}/edit`}>
                  <Button size="lg" className="rounded-2xl bg-white text-black hover:bg-zinc-200">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 rounded-3xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : profile ? (
          <div className="space-y-12">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard 
                icon={LayoutGrid} 
                label="Tasks Created" 
                value={profile.tasks_created || 0} 
                color="orange" 
                delay={0.1} 
              />
              <StatCard 
                icon={Send} 
                label="Tasks Applied" 
                value={profile.tasks_applied || 0} 
                color="cyan" 
                delay={0.2} 
              />
              <StatCard 
                icon={Briefcase} 
                label="Tasks Assigned" 
                value={profile.tasks_assigned || 0} 
                color="purple" 
                delay={0.3} 
              />
              <StatCard 
                icon={CheckCircle2} 
                label="Tasks Completed" 
                value={profile.tasks_completed || 0} 
                color="blue" 
                delay={0.4} 
              />
              <StatCard 
                icon={Zap} 
                label="STX Earned" 
                value={formatSTX(profile.total_stx_earned || 0)} 
                color="green" 
                delay={0.5} 
              />
              <StatCard 
                icon={ShieldCheck} 
                label="STX Funded" 
                value={formatSTX(profile.total_stx_funded || 0)} 
                color="rose" 
                delay={0.6} 
              />
            </div>

            {/* Additional Details Section */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.7 }}
               className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <Card className="border-zinc-800/50 bg-zinc-900/20 p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-500" />
                  Reputation & Scoring
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Current Score</span>
                    <span className="text-2xl font-black text-orange-500">{profile.current_score || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400" 
                      style={{ width: `${Math.min(100, (profile.current_score || 0) / 10)}%` }} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Average Tip</span>
                    <span className="text-xl font-bold">{profile.avg_tip_percent || 0}%</span>
                  </div>
                </div>
              </Card>

              <Card className="border-zinc-800/50 bg-zinc-900/20 p-8 flex flex-col justify-center text-center">
                <p className="text-zinc-400 mb-4 italic">"Building the future of decentralized work, one task at a time."</p>
                <div className="flex justify-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors cursor-pointer">
                     <Github className="h-5 w-5" />
                   </div>
                </div>
              </Card>
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/20 rounded-[40px] border border-dashed border-zinc-800/50">
             <User className="h-16 w-16 text-zinc-800 mx-auto mb-6" />
             <h2 className="text-2xl font-bold text-zinc-400 mb-2">No Profile Found</h2>
             <p className="text-zinc-600 max-w-sm mx-auto mb-8">
               This address hasn't been registered on Taskify yet. Join our community to start building.
             </p>
             <Link href="/register">
               <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl px-8">
                 Register Now
               </Button>
             </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function Button({ children, className, variant = "primary", size = "md", ...props }: any) {
  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center font-bold transition-all active:scale-95 disabled:opacity-50",
        variant === "primary" && "bg-white text-black hover:opacity-90",
        variant === "outline" && "border border-zinc-800 text-white hover:bg-zinc-900",
        variant === "ghost" && "text-zinc-400 hover:text-white hover:bg-zinc-900",
        size === "md" && "px-6 py-2.5 text-sm",
        size === "lg" && "px-8 py-3.5 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
