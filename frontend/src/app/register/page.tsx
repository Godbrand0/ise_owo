"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useStacks } from "@/context/StacksContext";
import { registerUser } from "@/lib/contract";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UserPlus, Wallet, Github, GitPullRequest, Search, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const { 
    isConnected, 
    address, 
    connectWallet, 
    isRegistered, 
    refreshUserData,
    githubLinked,
    setGithubLinked,
    verifiedGithubUsername,
    setVerifiedGithubUsername,
    userRole,
    setUserRole
  } = useStacks();
  
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Auto-advance if registered
  useEffect(() => {
    if (isRegistered) {
      router.push("/tasks");
    }
  }, [isRegistered, router]);

  // Auto-advance if wallet already connected when landing on step 1

  const handleVerifyGithubProfile = async () => {
// ... existing handleVerifyGithubProfile ...
    if (!githubInput.trim()) {
      toast.error("Please enter your GitHub username.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://api.github.com/users/${githubInput.trim()}`);
      if (response.ok) {
        const data = await response.json();
        setVerifiedGithubUsername(data.login);
        setGithubLinked(true);
        setStep(3);
        toast.success(`GitHub account @${data.login} verified!`);
      } else {
        toast.error("GitHub user not found. Please check the spelling.");
      }
    } catch (err) {
      console.error("GitHub check error:", err);
      toast.error("Failed to connect to GitHub. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelection = (role: "creator" | "contributor") => {
    setUserRole(role);
    setStep(4);
  };

// ... (handleSubmit starts here) ...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connectWallet();
      return;
    }

    setIsLoading(true);
    try {
      // 1. Initiate on-chain registration
      await registerUser(
        username,
        async () => {
          toast.success("Transaction submitted to blockchain!");
          
          // 2. Save off-chain metadata to our backend
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"}/api/users`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                address,
                username,
                github_username: verifiedGithubUsername,
                role: userRole
              })
            });
            
            if (res.ok) {
              toast.success("Profile metadata saved!");
            }
          } catch (err) {
            console.error("Failed to save metadata to backend:", err);
          }

          // 3. Wait for confirmation and redirect
          toast.success("Waiting for block confirmation...");
          let attempts = 0;
          const interval = setInterval(async () => {
            attempts++;
            await refreshUserData();
            if (attempts >= 4) {
              clearInterval(interval);
              router.push("/tasks");
            }
          }, 5000);
        },
        () => {
          setIsLoading(false);
          toast.error("Registration cancelled");
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to register");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      
      <main className="pt-40 px-4 mx-auto max-w-2xl">
        <div className="mb-10 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map(i => (
             <div 
               key={i} 
               className={`h-2.5 rounded-full transition-all duration-300 ${step === i ? "w-12 bg-orange-600" : step > i ? "w-4 bg-orange-600/50" : "w-4 bg-zinc-800"}`} 
             />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-zinc-900 border border-zinc-800 mb-8 mx-auto">
                 <Wallet className="h-10 w-10 text-orange-500" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">Connect Wallet</h1>
              <p className="text-lg text-zinc-400 mb-10 max-w-md mx-auto">
                Authenticate with your Stacks wallet to create your secure identity on the platform.
              </p>
              <Button size="lg" className="h-16 px-10 text-xl font-bold rounded-2xl bg-orange-600 hover:bg-orange-500 shadow-xl shadow-orange-900/20" onClick={connectWallet}>
                Connect Hiro Wallet
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 border-4 border-zinc-800 mb-8 mx-auto">
                 <Github className="h-12 w-12 text-zinc-100" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">Verify GitHub</h1>
              <p className="text-lg text-zinc-400 mb-10 max-w-md mx-auto">
                Enter your GitHub handle to import your identity and build trust as a developer.
              </p>
              
              <div className="space-y-4 max-w-sm mx-auto">
                <Input 
                  placeholder="Your GitHub username (e.g. octocat)"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  className="h-14 text-center text-lg bg-zinc-900 border-zinc-800 rounded-xl"
                />
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 flex items-center justify-center gap-3" 
                  onClick={handleVerifyGithubProfile}
                  isLoading={isLoading}
                >
                  <Github className="h-5 w-5" /> {isLoading ? "Verifying..." : "Verify GitHub Account"}
                </Button>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setStep(3)} 
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors font-medium"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">Choose your path</h1>
              <p className="text-lg text-zinc-400 mb-10 max-w-md mx-auto">
                How do you plan to use Taskify primarily?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button onClick={() => handleRoleSelection("contributor")} className="text-left">
                  <Card className="border-2 border-zinc-800 bg-zinc-950 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all h-full cursor-pointer group">
                    <CardContent className="p-8">
                      <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <GitPullRequest className="h-7 w-7 text-orange-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Contributor</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        I want to solve bounties, push code, and earn STX for my contributions.
                      </p>
                    </CardContent>
                  </Card>
                </button>

                <button onClick={() => handleRoleSelection("creator")} className="text-left">
                  <Card className="border-2 border-zinc-800 bg-zinc-950 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all h-full cursor-pointer group">
                    <CardContent className="p-8">
                      <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Search className="h-7 w-7 text-blue-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Creator</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        I want to fund tasks, find talented developers, and manage open source projects.
                      </p>
                    </CardContent>
                  </Card>
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-green-600/10 mb-8 mx-auto">
                 <UserPlus className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">Complete Profile</h1>
              <p className="text-lg text-zinc-400 mb-10 max-w-md mx-auto">
                Choose a unique username to finalize your registration on the blockchain.
              </p>

              <form onSubmit={handleSubmit} className="text-left max-w-md mx-auto">
                <Card className="border-zinc-800 bg-zinc-950 shadow-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold">Username</CardTitle>
                    <CardDescription>This will be your permanent on-chain identity.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <Input 
                      placeholder="e.g. SatoshiBuilder" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      minLength={3}
                      maxLength={50}
                      className="h-14 text-lg bg-zinc-900 border-zinc-800 rounded-xl"
                    />
                    
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50 space-y-2">
                       <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider">Wallet</span>
                          <span className="font-mono text-zinc-300 flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500"/> {address ? address.substring(0, 5) + "..." + address.substring(address.length - 4) : "None"}</span>
                       </div>
                       <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider">GitHub</span>
                          <span className="font-mono text-zinc-300 flex items-center gap-1.5">
                            {verifiedGithubUsername ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-green-500"/> 
                                <span className="text-orange-500">@{verifiedGithubUsername}</span>
                              </>
                            ) : "Skipped"}
                          </span>
                       </div>
                       <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider">Role</span>
                          <span className="font-mono text-zinc-300 capitalize">{userRole}</span>
                       </div>
                    </div>

                  </CardContent>
                  <div className="p-6 pt-0">
                     <Button size="lg" className="w-full h-14 text-lg font-bold rounded-xl bg-orange-600 hover:bg-orange-500" type="submit" isLoading={isLoading} disabled={!isConnected}>
                       Register on Stacks
                     </Button>
                  </div>
                </Card>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
