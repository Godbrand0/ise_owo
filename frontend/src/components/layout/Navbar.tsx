"use client";

import { useState } from "react";
import Link from "next/link";
import { useStacks } from "../../context/StacksContext";
import { Button } from "../ui/Button";
import { LogOut, Wallet, Menu, Github, GitPullRequest, Search, X, Trophy } from "lucide-react";
import { truncateAddress } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { isConnected, address, connectWallet, disconnectWallet, githubLinked, userRole } = useStacks();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { href: "/tasks", label: "Browse Tasks" },
    { href: "/creator", label: "For Creators" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 font-bold text-white transition-transform hover:scale-105">
              T
            </div>
            <span className="text-xl font-bold tracking-tight">Taskify</span>
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="text-sm font-medium text-zinc-600 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop Auth Section */}
          <div className="hidden items-center gap-4 sm:flex">
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-2">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-500 flex items-center gap-1">
                    {userRole === "creator" && <><Search className="h-2.5 w-2.5 text-blue-500" /> Creator</>}
                    {userRole === "contributor" && <><GitPullRequest className="h-2.5 w-2.5 text-orange-500" /> Contributor</>}
                    {!userRole && "Connected"}
                  </span>
                  <span className="text-sm font-bold flex items-center gap-2 font-mono">
                    {truncateAddress(address!)}
                    {githubLinked && <Github className="h-3.5 w-3.5 text-zinc-400" />}
                  </span>
                </div>
                <Button variant="outline" size="icon" onClick={disconnectWallet} title="Disconnect" className="h-9 w-9 border-zinc-200 dark:border-zinc-800">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/register">
                <Button className="gap-2 h-9 px-4">
                  <Wallet className="h-4 w-4" />
                  Connect
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden h-10 w-10 text-zinc-600 dark:text-zinc-400" 
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay & Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm md:hidden"
            />

            {/* Side Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-[280px] bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 font-bold text-white">
                      T
                    </div>
                    <span className="text-xl font-bold tracking-tight">Taskify</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={closeMobileMenu} className="h-8 w-8">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMobileMenu}
                      className="flex items-center justify-between py-4 px-4 rounded-xl text-lg font-medium text-zinc-600 hover:text-orange-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-orange-500 dark:hover:bg-zinc-900/50 transition-all"
                    >
                      {link.label}
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                    </Link>
                  ))}
                </div>

                <div className="mt-auto pt-10 border-t border-zinc-100 dark:border-zinc-900">
                  {isConnected ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                          <Trophy className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[10px] font-bold uppercase text-zinc-500">
                            {userRole || "Connected"}
                          </span>
                          <span className="text-sm font-mono font-bold truncate">
                            {truncateAddress(address!)}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl" onClick={() => { disconnectWallet(); closeMobileMenu(); }}>
                        <LogOut className="h-4 w-4" />
                        Disconnect Wallet
                      </Button>
                    </div>
                  ) : (
                    <Link href="/register" onClick={closeMobileMenu}>
                      <Button className="w-full gap-2 h-12 rounded-xl text-base">
                        <Wallet className="h-5 w-5" />
                        Connect Wallet
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
