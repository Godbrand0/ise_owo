"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fetchAllTasks } from "@/lib/contract";
import { formatSTX, formatDate, unwrapCV } from "@/lib/utils";
import { useStacks } from "@/context/StacksContext";
import { Plus, Settings, Clock, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/auth/AuthGuard";

const statusMap: Record<number, string> = {
// ... existing statusMap ...
  0: "Open",
  1: "Assigned",
  2: "In Progress",
  3: "Submitted",
  4: "Approved",
  5: "Finalized",
  6: "Expired",
  7: "Cancelled",
};

export default function CreatorDashboard() {
  const { address, isConnected, userRole } = useStacks();
  const [createdTasks, setCreatedTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isCreator = userRole === "creator";

  const loadTasks = async () => {
    if (!address) {
      setCreatedTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const allTasks = await fetchAllTasks();
      
      const realCreated = allTasks
        .map((t: any) => {
          const flattened = Object.entries(t).reduce((acc: any, [key, val]: [string, any]) => {
            acc[key] = unwrapCV(val);
            return acc;
          }, {});
          return flattened;
        })
        .filter((t: any) => t.creator === address);
      
      setCreatedTasks(realCreated);
    } catch (e) {
      console.error("Error loading tasks:", e);
      setCreatedTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [address]);

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="pt-32 px-4 mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">Creator Dashboard</h1>
              <p className="text-zinc-400">Manage your bounties, review applications, and track progress.</p>
            </div>
            <Link href="/create">
              <Button size="lg" className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold gap-2">
                <Plus className="h-5 w-5" /> Create New Bounty
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                 <div key={i} className="h-64 rounded-3xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : !isCreator ? (
            <Card className="border-dashed border-zinc-800 bg-zinc-900/10 p-12 text-center flex flex-col items-center">
               <User className="h-12 w-12 text-blue-500 mb-4" />
               <h3 className="text-xl font-bold mb-2">Creator Account Required</h3>
               <p className="text-zinc-500 max-w-md mx-auto mb-6">
                 Your current profile is set as a Contributor. You need to be registered as a Creator to fund and manage tasks.
               </p>
               <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-500 font-bold">Update Profile</Button>
               </Link>
            </Card>
          ) : createdTasks.length === 0 ? (
            <Card className="border-dashed border-zinc-800 bg-zinc-900/10 p-12 text-center flex flex-col items-center">
               <Settings className="h-12 w-12 text-zinc-700 mb-4" />
               <h3 className="text-xl font-bold mb-2">No Bounties Yet</h3>
               <p className="text-zinc-500 max-w-md mx-auto mb-6">
                 You haven't posted any bounties. Create your first task to find great contributors.
               </p>
               <Link href="/create">
                  <Button variant="outline" className="border-zinc-700">Start Building</Button>
               </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {createdTasks.map((task, idx) => {
                 const status = Number(task.status);
                 const isActionable = status === 0 && task.applications && task.applications.length > 0;
                 
                 return (
                   <motion.div
                     key={task.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1 }}
                   >
                     <Card className={`border-zinc-800 bg-zinc-950 flex flex-col h-full ${isActionable ? 'ring-1 ring-orange-500/50 border-orange-500/30' : ''}`}>
                       <CardHeader>
                         <div className="flex items-center justify-between mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              status === 0 ? "bg-orange-600/10 text-orange-500 border border-orange-600/20" :
                              status === 5 ? "bg-green-600/10 text-green-500 border border-green-600/20" :
                              "bg-blue-600/10 text-blue-500 border border-blue-600/20"
                            }`}>
                              {statusMap[status]}
                            </span>
                            
                            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
                              {task.tokenType === "USDCx" ? Number(task.fundingAmount) / 1000000 : formatSTX(task.fundingAmount)} <span className="text-zinc-600">{task.tokenType || "STX"}</span>
                            </div>
                         </div>
                         <CardTitle className="text-xl line-clamp-1">{task.title}</CardTitle>
                       </CardHeader>
                       
                       <CardContent className="flex-grow space-y-4">
                          <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono">
                             <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" /> 
                                {task.deadline > 1000000 ? formatDate(task.deadline) : `Block ${task.deadline}`}
                             </div>
                             {task.assignee && (
                               <div className="flex items-center gap-1.5">
                                 <User className="h-3.5 w-3.5" />
                                 Assigned
                               </div>
                             )}
                             {status === 0 && (
                               <div className={`px-2 py-1 rounded-md font-bold ${task.applications && task.applications.length > 0 ? "bg-zinc-800 text-orange-400" : ""}`}>
                                  {task.applications ? task.applications.length : 0} Applicants
                               </div>
                             )}
                          </div>
                       </CardContent>

                       <CardFooter className="pt-4 border-t border-zinc-900">
                          <Link href={`/tasks/${task.id}`} className="w-full">
                            <Button variant="secondary" className="w-full justify-between group">
                              Manage Bounty
                              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-100 transition-colors" />
                            </Button>
                          </Link>
                       </CardFooter>
                     </Card>
                   </motion.div>
                 );
               })}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
