"use client";

import Link from "next/link";
import { useStacks } from "../../context/StacksContext";
import { Button } from "../ui/Button";
import { LogOut, Wallet, Menu, Github, GitPullRequest, Search } from "lucide-react";
import { truncateAddress } from "../../lib/utils";

export function Navbar() {
  const { isConnected, address, connectWallet, disconnectWallet, githubLinked, userRole } = useStacks();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 font-bold text-white">
              T
            </div>
            <span className="text-xl font-bold tracking-tight">Taskify</span>
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/tasks" className="text-sm font-medium text-zinc-600 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-500">
              Browse Tasks
            </Link>
            <Link href="/create" className="text-sm font-medium text-zinc-600 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-500">
              Create Task
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium text-zinc-600 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-500">
              Leaderboard
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="hidden flex-col items-end sm:flex mr-4">
                <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                  {userRole === "creator" && <><Search className="h-3 w-3 text-blue-500" /> Creator</>}
                  {userRole === "contributor" && <><GitPullRequest className="h-3 w-3 text-orange-500" /> Contributor</>}
                  {!userRole && "Connected"}
                </span>
                <span className="text-sm font-bold flex items-center gap-2">
                  {truncateAddress(address!)}
                  {githubLinked && <Github className="h-3.5 w-3.5 text-zinc-400" title="GitHub Linked" />}
                </span>
              </div>
              <Button variant="outline" size="icon" onClick={disconnectWallet} title="Disconnect">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={connectWallet} className="gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
