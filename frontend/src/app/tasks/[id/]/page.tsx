"use client";

import { use, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { getTask, applyForTask, assignTask, startTask, completeTask, approveAndRelease, hasApplied } from "@/lib/contract";
import { formatSTX, truncateAddress } from "@/lib/utils";
import { useStacks } from "@/context/StacksContext";
import { toast } from "react-hot-toast";
import { CheckCircle, Clock, Github, ShieldAlert, User, Wallet } from "lucide-react";
import Link from "next/link";

export default function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const taskId = parseInt(id);
  const { isConnected, address, connectWallet } = useStacks();
  
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const taskData = await getTask(taskId);
      if (taskData) {
        // Flatten
        const flattened = Object.entries(taskData).reduce((acc: any, [key, val]: [string, any]) => {
          acc[key] = val.value !== undefined ? val.value : val;
          return acc;
        }, {});
        setTask(flattened);
        
        if (address) {
          const applied = await hasApplied(taskId, address);
          setAlreadyApplied(applied);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [taskId, address]);

  const handleApply = async () => {
    if (!isConnected) return connectWallet();
    setIsActionLoading(true);
    try {
      await applyForTask(taskId, 
        () => {
          toast.success("Application submitted!");
          loadData();
          setIsActionLoading(false);
        },
        () => {
          setIsActionLoading(false);
          toast.error("Application cancelled");
        }
      );
    } catch (e) {
      toast.error("Failed to apply");
      setIsActionLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setIsActionLoading(true);
    try {
      const onFinish = () => {
        toast.success(`${action} successful!`);
        loadData();
        setIsActionLoading(false);
      };
      const onCancel = () => {
        setIsActionLoading(false);
      };

      if (action === "start") await startTask(taskId, onFinish, onCancel);
      if (action === "complete") await completeTask(taskId, onFinish, onCancel);
      if (action === "approve") await approveAndRelease(taskId, onFinish, onCancel);
    } catch (e) {
      toast.error(`Failed to ${action}`);
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Navbar />
        <main className="pt-32 px-4 mx-auto max-w-4xl">
          <div className="h-96 rounded-3xl bg-zinc-900 animate-pulse border border-zinc-800" />
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen pb-20 text-center">
        <Navbar />
        <main className="pt-40">
          <h1 className="text-2xl font-bold">Task not found</h1>
          <Link href="/tasks" className="mt-4 inline-block text-orange-500">Back to explorer</Link>
        </main>
      </div>
    );
  }

  const isCreator = address === task.creator;
  const isAssignee = address === task.assignee;
  const status = Number(task.status);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="pt-32 px-4 mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-grow space-y-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
               <span className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-orange-600/10 text-orange-500 border border-orange-600/20">
                 Bounty #{taskId}
               </span>
               <span className="px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                 Status ID: {status}
               </span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight">{task.title}</h1>
            
            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-xl">Description</CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </CardContent>
              {task.githubLink && (
                <CardFooter className="border-t border-zinc-900 pt-6">
                  <a 
                    href={task.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400 font-medium"
                  >
                    <Github className="h-4 w-4" />
                    View GitHub Repository
                  </a>
                </CardFooter>
              )}
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-zinc-800 p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center">
                      <User className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase">Creator</p>
                      <p className="text-sm font-mono">{truncateAddress(task.creator)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="border-zinc-800 p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase">Funding</p>
                      <p className="text-sm font-bold text-orange-500">{formatSTX(task.fundingAmount)} STX</p>
                    </div>
                  </div>
                </Card>
            </div>
          </div>

          {/* Sidebar / Actions */}
          <div className="w-full md:w-80 shrink-0 space-y-6">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
                <CardDescription>Manage this bounty</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {status === 0 && !isCreator && (
                  <Button 
                    className="w-full" 
                    onClick={handleApply} 
                    isLoading={isActionLoading}
                    disabled={alreadyApplied}
                  >
                    {alreadyApplied ? "Already Applied" : "Apply for Bounty"}
                  </Button>
                )}
                
                {status === 0 && isCreator && (
                  <div className="space-y-2">
                    <p className="text-xs text-center text-zinc-500">Wait for applicants to assign them work.</p>
                    <Button variant="outline" className="w-full" disabled>Assign Contributor</Button>
                  </div>
                )}

                {status === 1 && isAssignee && (
                  <Button className="w-full" onClick={() => handleAction("start")} isLoading={isActionLoading}>
                    Start Working
                  </Button>
                )}

                {status === 2 && isAssignee && (
                  <Button className="w-full" onClick={() => handleAction("complete")} isLoading={isActionLoading}>
                    Submit for Approval
                  </Button>
                )}

                {status === 3 && isCreator && (
                  <Button className="w-full" onClick={() => handleAction("approve")} isLoading={isActionLoading}>
                    Approve and Release Funds
                  </Button>
                )}

                {status === 5 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <p className="text-sm font-bold text-green-500 uppercase tracking-wider">Finalized</p>
                    <p className="text-xs text-zinc-400">Funds have been released to the contributor.</p>
                  </div>
                )}

                {(!isConnected) && (
                   <Button variant="outline" className="w-full" onClick={connectWallet}>Connect Wallet to Interact</Button>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex flex-col gap-3 text-xs text-zinc-500 border-t border-zinc-800 mt-4 py-4">
                 <div className="flex w-full justify-between items-center">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Deadline</span>
                    <span>Block {Number(task.deadline)}</span>
                 </div>
              </CardFooter>
            </Card>

            {task.assignee && (
              <Card className="border-zinc-800 bg-zinc-950 p-4">
                 <p className="text-xs text-zinc-500 font-medium uppercase mb-2">Assigned to</p>
                 <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center">
                       <User className="h-3 w-3 text-zinc-400" />
                    </div>
                    <span className="text-sm font-mono">{truncateAddress(task.assignee)}</span>
                 </div>
              </Card>
            )}
            
            {status === 6 && (
               <Card className="border-red-900 bg-red-950/20 p-4 flex items-center gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-500">This bounty has expired. The creator can reclaim the funds.</p>
               </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
