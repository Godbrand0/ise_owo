"use client";

import { use, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getTask, applyForTask, startTask, completeTask, approveAndRelease, hasApplied, assignTask, cancelTask, reclaimFunds } from "@/lib/contract";
import { formatSTX, truncateAddress, formatDate, unwrapCV } from "@/lib/utils";
import { useStacks } from "@/context/StacksContext";
import { toast } from "react-hot-toast";
import { 
  CheckCircle2, 
  Github, 
  ShieldAlert, 
  User, 
  Wallet, 
  Calendar,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Ban,
  RotateCcw
} from "lucide-react";
import Link from "next/link";

const STAGES = [
  { id: 0, name: "Created", description: "Bounty is open for applications" },
  { id: 1, name: "Assigned", description: "Contributor has been selected" },
  { id: 2, name: "In Progress", description: "Work is currently underway" },
  { id: 3, name: "Submitted", description: "Work is awaiting approval" },
  { id: 5, name: "Finalized", description: "Funds released to contributor" },
];

export default function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const taskId = id.startsWith("mock-") ? id : parseInt(id);
  const { isConnected, address, connectWallet, userRole } = useStacks();

  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [proposalText, setProposalText] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const taskData = await getTask(taskId as number);
      if (taskData) {
        const flattened = Object.entries(taskData).reduce((acc: any, [key, val]: [string, any]) => {
          acc[key] = unwrapCV(val);
          return acc;
        }, {});
        // Append an empty applications array for real tasks for now since we don't fetch off-chain metadata yet
        setTask({ ...flattened, applications: [] });

        if (address) {
          const applied = await hasApplied(taskId as number, address);
          setAlreadyApplied(applied);
        }
      }
    } catch (e) {
      console.error("Error loading task detail:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [taskId, address]);

  const handleApplyClick = () => {
    if (!isConnected) return connectWallet();
    setShowApplyForm(true);
  };

  const handleApplySubmit = async () => {
    if (!proposalText.trim()) {
      toast.error("Please provide a proposal for your application.");
      return;
    }
    setIsActionLoading(true);
    try {
      await applyForTask(taskId as number,
        () => {
          toast.success("Application submitted!");
          setShowApplyForm(false);
          setAlreadyApplied(true);
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

  const handleAssign = async (applicantAddress: string) => {
    setIsActionLoading(true);
    try {
      await assignTask(taskId as number, applicantAddress,
        () => {
          toast.success("Bounty successfully assigned!");
          loadData();
          setIsActionLoading(false);
        },
        () => {
          setIsActionLoading(false);
          toast.error("Assignment cancelled");
        }
      );
    } catch (e) {
      toast.error("Failed to assign task");
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
      const onCancel = () => setIsActionLoading(false);

      if (action === "start") await startTask(taskId as number, onFinish, onCancel);
      if (action === "complete") await completeTask(taskId as number, onFinish, onCancel);
      if (action === "approve") await approveAndRelease(taskId as number, Number(task.tokenType), onFinish, onCancel);
      if (action === "cancel") await cancelTask(taskId as number, Number(task.tokenType), onFinish, onCancel);
      if (action === "reclaim") await reclaimFunds(taskId as number, Number(task.tokenType), onFinish, onCancel);
    } catch (e) {
      toast.error(`Failed to ${action}`);
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Navbar />
        <main className="pt-32 px-4 mx-auto max-w-5xl">
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

  const isCreator = address === task.creator || userRole === "creator";
  const isAssignee = address === task.assignee;
  const status = Number(task.status);
  
  const displayDeadline = task.deadline > 1000000 
    ? formatDate(task.deadline) 
    : `Block ${task.deadline}`;

  return (
    <div className="min-h-screen pb-20">
      <Navbar />

      <main className="pt-32 px-4 mx-auto max-w-5xl">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
          <Link href="/tasks" className="hover:text-orange-500 transition-colors">Bounties</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-300">Bounty #{typeof taskId === 'string' ? taskId.replace('mock-', '') : taskId}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Details */}
          <div className="flex-grow space-y-10">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-600/10 text-orange-500 border border-orange-600/20">
                  {status === 0 ? "Open Bounty" : statusMap[status]}
                </span>
                {task.githubLink && (
                  <a href={task.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white transition-colors">
                    <Github className="h-3 w-3" /> GitHub Repo
                  </a>
                )}
                {task.assignee && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600/10 text-blue-500 border border-blue-600/20">
                    <User className="h-3 w-3" /> Assigned to {truncateAddress(task.assignee)}
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{task.title}</h1>
            </div>

            {/* Progress Tracker */}
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-3xl p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-8">Bounty Lifecycle</h3>
              <div className="relative flex justify-between">
                <div className="absolute top-5 left-0 w-full h-0.5 bg-zinc-800 -z-10" />
                
                {STAGES.map((stage, idx) => {
                  const isActive = (stage.id === status) || (status === 4 && stage.id === 3);
                  const isCompleted = status > stage.id || (status === 5);
                  
                  return (
                    <div key={idx} className="flex flex-col items-center gap-3 text-center max-w-[100px]">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        isCompleted ? "bg-orange-600 border-orange-600 text-white" :
                        isActive ? "bg-zinc-950 border-orange-600 text-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.3)]" :
                        "bg-zinc-900 border-zinc-800 text-zinc-600"
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <span>{idx + 1}</span>}
                      </div>
                      <div className="space-y-1">
                        <p className={`text-[10px] font-bold uppercase ${isActive ? "text-orange-500" : "text-zinc-500"}`}>{stage.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Requirement Details</h2>
              <div className="prose prose-invert max-w-none bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
                <p className="text-zinc-300 leading-relaxed text-lg whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>

            {/* Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link href={`/profile/${task.creator}`}>
                  <Card className="border-zinc-800 p-6 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-orange-600/50 transition-colors">
                        <User className="h-6 w-6 text-zinc-400 group-hover:text-orange-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Creator</p>
                        <p className="text-sm font-mono text-zinc-200">{truncateAddress(task.creator)}</p>
                      </div>
                      <ExternalLink className="h-3 w-3 text-zinc-600 ml-auto group-hover:text-orange-500" />
                    </div>
                  </Card>
                </Link>

                {task.assignee ? (
                  <Link href={`/profile/${task.assignee}`}>
                    <Card className="border-zinc-800 p-6 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-blue-600/50 transition-colors">
                          <CheckCircle2 className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Assignee</p>
                          <p className="text-sm font-mono text-zinc-200">{truncateAddress(task.assignee)}</p>
                        </div>
                        <ExternalLink className="h-3 w-3 text-zinc-600 ml-auto group-hover:text-blue-500" />
                      </div>
                    </Card>
                  </Link>
                ) : (
                  <Card className="border-zinc-800 border-dashed p-6 bg-transparent flex items-center justify-center">
                    <p className="text-xs text-zinc-500 font-medium italic">No assignee yet</p>
                  </Card>
                )}
            </div>

            {/* Applications List Section */}
            {task.applications && task.applications.length > 0 && (
              <div className="space-y-6 pt-10 border-t border-zinc-900">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-orange-500" /> 
                  Applications ({task.applications.length})
                </h2>
                
                <div className="space-y-4">
                  {task.applications.map((app: any, idx: number) => (
                    <Card key={idx} className="border-zinc-800 bg-zinc-950 p-6">
                      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                        <div className="space-y-4 flex-grow">
                          <div className="flex items-center justify-between">
                            <Link href={`/profile/${app.applicant}`} className="flex items-center gap-2 hover:text-orange-500 transition-colors group">
                               <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                 <User className="h-4 w-4 text-zinc-400 group-hover:text-orange-500" />
                               </div>
                               <span className="font-mono text-sm">{truncateAddress(app.applicant)}</span>
                            </Link>
                            <span className="text-xs text-zinc-500">{formatDate(app.date)}</span>
                          </div>
                          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 text-sm text-zinc-300 whitespace-pre-wrap">
                            "{app.proposal}"
                          </div>
                        </div>

                        {/* Assign Button for Creators */}
                        {(isCreator && status === 0 && !task.assignee) && (
                          <div className="w-full md:w-auto flex-shrink-0">
                            <Button 
                              onClick={() => handleAssign(app.applicant)}
                              isLoading={isActionLoading}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
                            >
                              Assign Bounty
                            </Button>
                          </div>
                        )}
                        {(task.assignee === app.applicant) && (
                          <div className="w-full md:w-auto flex-shrink-0 flex items-center justify-center bg-blue-600/10 text-blue-500 px-4 py-2 rounded-xl font-bold text-sm gap-2">
                            <CheckCircle2 className="h-4 w-4" /> Selected
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Sidebar Actions */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-32 space-y-6">
              <Card className="border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
                <div className="h-2 bg-orange-600" />
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-zinc-400" /> 
                    Reward Pool
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                  <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 flex flex-col items-center justify-center gap-1">
                    <span className="text-4xl font-black text-white">{formatSTX(task.fundingAmount)}</span>
                    <span className="text-orange-500 font-bold tracking-widest text-xs uppercase">Stacks (STX)</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm py-2 border-b border-zinc-900">
                      <span className="text-zinc-500">Deadline</span>
                      <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-orange-500" />
                        {displayDeadline}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-2 border-b border-zinc-900">
                      <span className="text-zinc-500">Status</span>
                      <span className="text-zinc-200 font-bold capitalize">{statusMap[status] || "Created"}</span>
                    </div>
                    {task.assignee && (
                      <div className="flex items-center justify-between text-sm py-2 border-b border-zinc-900">
                        <span className="text-zinc-500">Assignee</span>
                        <Link href={`/profile/${task.assignee}`} className="text-blue-500 font-bold hover:underline font-mono">
                          {truncateAddress(task.assignee)}
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    {/* Non-Creator applying */}
                    {status === 0 && !isCreator && !showApplyForm && !alreadyApplied && (
                      <Button
                        className="w-full h-14 text-lg font-bold rounded-2xl bg-orange-600 hover:bg-orange-500 shadow-lg shadow-orange-900/20"
                        onClick={handleApplyClick}
                        isLoading={isActionLoading}
                        disabled={alreadyApplied}
                      >
                        Submit Application
                      </Button>
                    )}

                    {/* Apply Form State */}
                    {showApplyForm && status === 0 && !isCreator && (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-300">Why are you the best fit?</label>
                          <textarea 
                            className="w-full min-h-[120px] rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-600/50 resize-none transition-all"
                            placeholder="Share your experience, relevant links, and how you plan to complete this bounty..."
                            value={proposalText}
                            onChange={(e) => setProposalText(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button variant="outline" className="rounded-xl border-zinc-800" onClick={() => setShowApplyForm(false)}>
                            Cancel
                          </Button>
                          <Button className="rounded-xl bg-orange-600 hover:bg-orange-500" onClick={handleApplySubmit} isLoading={isActionLoading}>
                            Confirm
                          </Button>
                        </div>
                      </div>
                    )}

                    {alreadyApplied && status === 0 && (
                       <Button disabled className="w-full h-14 text-sm font-bold rounded-2xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 gap-2">
                         <CheckCircle2 className="h-4 w-4" /> Application Pending
                       </Button>
                    )}

                    {status === 0 && isCreator && (
                      <div className="space-y-2 text-center p-4 border border-dashed border-zinc-800 bg-zinc-900/20 rounded-2xl">
                        <p className="text-sm text-zinc-400">Review applications below to assign this bounty.</p>
                      </div>
                    )}

                    {status === 1 && isAssignee && (
                      <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-500" onClick={() => handleAction("start")} isLoading={isActionLoading}>
                        Claim & Start Work
                      </Button>
                    )}

                    {status === 2 && isAssignee && (
                      <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-orange-600 hover:bg-orange-500" onClick={() => handleAction("complete")} isLoading={isActionLoading}>
                        Submit Proof of Work
                      </Button>
                    )}

                    {status === 3 && isCreator && (
                      <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-green-600 hover:bg-green-500" onClick={() => handleAction("approve")} isLoading={isActionLoading}>
                        Approve & Release
                      </Button>
                    )}

                    {/* Creator Actions: Cancel & Reclaim */}
                    {isCreator && (
                      <div className="mt-4 space-y-3">
                        {(status === 0 || status === 1 || status === 2) && (
                          <Button 
                            variant="outline" 
                            className="w-full h-12 rounded-xl text-red-500 border-red-500/20 hover:bg-red-500/10 gap-2" 
                            onClick={() => handleAction("cancel")} 
                            isLoading={isActionLoading}
                          >
                            <Ban className="h-4 w-4" /> Cancel Bounty
                          </Button>
                        )}
                        {status === 6 && (
                          <Button 
                            className="w-full h-14 text-lg font-bold rounded-2xl bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 gap-2" 
                            onClick={() => handleAction("reclaim")} 
                            isLoading={isActionLoading}
                          >
                            <RotateCcw className="h-5 w-5" /> Reclaim Funds
                          </Button>
                        )}
                      </div>
                    )}

                    {status === 5 && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                        <div className="space-y-1">
                          <p className="text-sm font-black text-green-500 uppercase tracking-widest">Rewards Released</p>
                          <p className="text-xs text-zinc-400">This bounty is officially archived.</p>
                        </div>
                      </div>
                    )}

                    {!isConnected && (
                      <Button className="w-full h-14 text-lg font-bold rounded-2xl gap-2 mt-4" onClick={connectWallet}>
                        <Wallet className="h-5 w-5" /> Connect to Interact
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {status === 6 && (
                <Card className="border-red-900/50 bg-red-950/10 p-6 flex items-start gap-4 rounded-3xl">
                   <ShieldAlert className="h-6 w-6 text-red-500 shrink-0" />
                   <div className="space-y-1">
                     <p className="text-sm font-bold text-red-500">Bounty Expired</p>
                     <p className="text-xs text-red-400/80 leading-relaxed">The deadline has passed. The creator can now reclaim the locked funds.</p>
                   </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const statusMap: Record<number, string> = {
  0: "Created",
  1: "Assigned",
  2: "In Progress",
  3: "Submitted",
  4: "Approved",
  5: "Finalized",
  6: "Expired",
  7: "Cancelled",
};
