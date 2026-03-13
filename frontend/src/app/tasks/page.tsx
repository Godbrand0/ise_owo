"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { fetchAllTasks } from "@/lib/contract";
import { formatSTX, truncateAddress } from "@/lib/utils";
import { Clock, ExternalLink, RefreshCw, Search, Tag } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { STX_PRECISION } from "@/lib/constants";

export const MOCK_TASKS = [
  {
    id: "mock-1",
    title: "Implement landing page design",
    description: "Create a modern, responsive landing page using Next.js and Tailwind CSS. The design should be clean, professional, and mobile-friendly.",
    status: 0,
    fundingAmount: 50 * STX_PRECISION,
    creator: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    assignee: null,
    githubLink: "https://github.com/example/landing-page",
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000, 
    applications: [
      {
        applicant: "ST3NBRSFY96H4A9QW8R5PF4NR62S64K33K8L6Y2G",
        proposal: "I have 5 years of experience with Next.js and Tailwind. I can deliver a high-quality, responsive landing page in exactly 4 days. Here is my portfolio: example.com",
        date: Date.now() - 1 * 24 * 60 * 60 * 1000
      },
      {
        applicant: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
        proposal: "Ready to start immediately. I've built similar landing pages for Web3 projects before.",
        date: Date.now() - 12 * 60 * 60 * 1000
      }
    ]
  },
  {
    id: "mock-2",
    title: "Write documentation for Stacks API",
    description: "Prepare comprehensive documentation for the core API endpoints of the Stacks blockchain. Cover authentication, data retrieval, and transaction broadcasting.",
    status: 1,
    fundingAmount: 25 * STX_PRECISION,
    creator: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
    assignee: "ST3NBRSFY96H4A9QW8R5PF4NR62S64K33K8L6Y2G",
    githubLink: "https://github.com/example/stacks-docs",
    deadline: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days from now
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: "mock-3",
    title: "Bug fix: Wallet connection issue",
    description: "Investigate and resolve the reported bug in the Hiro wallet connection flow where the address is not being correctly displayed after a successful connection.",
    status: 2,
    fundingAmount: 15 * STX_PRECISION,
    creator: "ST3NBRSFY96H4A9QW8R5PF4NR62S64K33K8L6Y2G",
    assignee: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    githubLink: null,
    deadline: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: "mock-4",
    title: "Integrate Pyth price feeds",
    description: "Add Pyth oracle price feeds to the taskify contract to display task USD values in real-time. Ensure proper error handling for feed failures.",
    status: 0,
    fundingAmount: 100 * STX_PRECISION,
    creator: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    assignee: null,
    githubLink: "https://github.com/example/pyth-integration",
    deadline: Date.now() + 10 * 24 * 60 * 60 * 1000,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    applications: []
  },
  {
    id: "mock-5",
    title: "Create Taskify mobile app prototype",
    description: "Design and build a functional mobile app prototype using React Native. Focus on the bounty browsing and submission management screens.",
    status: 3,
    fundingAmount: 200 * STX_PRECISION,
    creator: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
    assignee: "ST3NBRSFY96H4A9QW8R5PF4NR62S64K33K8L6Y2G",
    githubLink: "https://github.com/example/taskify-mobile",
    deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
];

const statusMap: Record<number, string> = {
  0: "Created",
  1: "Assigned",
  2: "In Progress",
  3: "Completed",
  4: "Approved",
  5: "Finalized",
  6: "Expired",
  7: "Cancelled",
};

const statusColor: Record<number, string> = {
  0: "bg-green-500/10 text-green-500 border-green-500/20",
  1: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  2: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  3: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  4: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  5: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  6: "bg-red-500/10 text-red-500 border-red-500/20",
  7: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllTasks();
      // Combine real tasks with mock data for display
      // Real tasks first, then mock tasks
      setTasks([...data.reverse(), ...MOCK_TASKS]);
    } catch (e) {
      console.error("Error loading tasks:", e);
      setTasks(MOCK_TASKS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="pt-32 px-4 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Explore Bounties</h1>
            <p className="text-zinc-400 mt-2">Find work, contribute, and earn STX.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-10 pr-4 h-11 w-full md:w-64 rounded-xl border border-zinc-800 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={loadTasks} isLoading={isLoading}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card hoverable className="h-full border-zinc-800 flex flex-col group">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                       <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusColor[Number(task.status)] || statusColor[0]}`}>
                          {statusMap[Number(task.status)] || "Unknown"}
                       </span>
                       <span className="text-orange-500 font-bold text-lg">
                         {formatSTX(task.fundingAmount)} STX
                       </span>
                    </div>
                    <CardTitle className="line-clamp-1 group-hover:text-orange-500 transition-colors">{task.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 h-10">
                      {task.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow pt-0 pb-4">
                    <div className="space-y-3 pt-4 border-t border-zinc-900">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Tag className="h-3 w-3" />
                        <span>Created by </span>
                        <span className="font-mono text-zinc-200">{truncateAddress(task.creator)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Clock className="h-3 w-3" />
                        <span>Deadline: block </span>
                        <span className="text-zinc-200">{Number(task.deadline)}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Link href={`/tasks/${task.id}`} className="w-full">
                      <Button variant="secondary" className="w-full gap-2">
                        View Details <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 mb-6">
              <Search className="h-8 w-8 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold">No tasks found</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mt-2">Try adjusting your search or check back later for new bounties.</p>
            <Link href="/create" className="mt-8 inline-block">
              <Button>Create the first task</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
