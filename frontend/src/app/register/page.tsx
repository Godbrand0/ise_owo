"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useStacks } from "@/context/StacksContext";
import { registerUser } from "@/lib/contract";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Wallet, Github, GitPullRequest, Search, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function RegisterForm() {
  const { 
    isConnected, 
    address, 
    connectWallet, 
    isRegistered, 
    userProfile,
    refreshUserData,
    githubLinked,
    setGithubLinked,
    verifiedGithubUsername,
    setVerifiedGithubUsername,
    userRole,
    setUserRole,
    isLoadingMetadata
  } = useStacks();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Handle OAuth callback parameters
  useEffect(() => {
    const isGithubVerified = searchParams.get("github_verified") === "true";
    const githubUser = searchParams.get("username");
    const error = searchParams.get("error");

    if (isGithubVerified && githubUser) {
      setVerifiedGithubUsername(githubUser);
      setGithubLinked(true);
      setStep(3); // Go to role selection
      toast.success(`GitHub account @${githubUser} verified!`);
      
      // Clean up URL parameters without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (error === "github_auth_failed") {
      toast.error("GitHub authentication failed. Please try again.");
      setStep(2);
    }
  }, [searchParams, setVerifiedGithubUsername, setGithubLinked]);

  // Check if we already have a role/registration on boot
  useEffect(() => {
    if (!isLoadingMetadata && isRegistered && userRole) {
      if (userRole === "creator") {
        router.push("/creator");
      } else {
        router.push("/tasks");
      }
    }
  }, [isRegistered, userRole, isLoadingMetadata, router]);

  // Advance to role selection if GitHub is successfully linked
  useEffect(() => {
    if (githubLinked && step === 2) {
      setStep(3);
    }
  }, [githubLinked, step]);

  // Combined wallet connection and initial step logic
  useEffect(() => {
    if (isLoadingMetadata) return;

    if (isConnected && step === 1) {
      // If already registered, don't advance to Step 2 (handled by redirection effect)
      if (isRegistered) return;

      // Check if we just came back from GitHub
      const isGithubVerified = searchParams.get("github_verified") === "true";
      if (isGithubVerified) {
        setStep(3);
      } else {
        setStep(2);
      }
    }
  }, [isConnected, step, searchParams, isRegistered, isLoadingMetadata]);

  // Pre-fill username if already registered on-chain
  useEffect(() => {
    if (isRegistered && userProfile?.username && !username) {
      setUsername(userProfile.username);
    }
  }, [isRegistered, userProfile, username]);

  if (isLoadingMetadata) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
        <p className="text-zinc-500 font-medium animate-pulse">Checking your identity...</p>
      </div>
    );
  }

  const handleVerifyGithubProfile = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    // Redirect to backend OAuth initiation
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
    window.location.href = `${backendUrl}/api/auth/github?address=${address}`;
  };

  const handleRoleSelection = (role: "creator" | "contributor") => {
    setUserRole(role);
    setStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connectWallet();
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistered) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address,
              username: userProfile?.username || username,
              github_username: verifiedGithubUsername,
              role: userRole
            })
          });
          
          if (res.ok) {
            toast.success("Profile updated!");
            await refreshUserData();
            if (userRole === "creator") {
              router.push("/creator");
            } else {
              router.push("/tasks");
            }
          } else {
            const errData = await res.json();
            toast.error(errData.error || "Failed to update profile");
          }
        } catch (err) {
          console.error("Failed to save metadata to backend:", err);
          toast.error("Network error saving profile");
        } finally {
          setIsLoading(false);
        }
        return;
      }

      await registerUser(
        username,
        async () => {
          toast.success("Transaction submitted to blockchain!");
          
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

          toast.success("Waiting for block confirmation...");
          let attempts = 0;
          const interval = setInterval(async () => {
            attempts++;
            await refreshUserData();
            if (attempts >= 4) {
              clearInterval(interval);
              if (userRole === "creator") {
                router.push("/creator");
              } else {
                router.push("/tasks");
              }
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
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">Connect GitHub</h1>
              <p className="text-lg text-zinc-400 mb-10 max-w-md mx-auto">
                Authorize Taskify to verify your developer identity and link your contributions.
              </p>
              
              <div className="space-y-4 max-w-sm mx-auto">
                <Button 
                  size="lg" 
                  className="w-full h-16 text-xl font-bold rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center gap-3 shadow-xl" 
                  onClick={handleVerifyGithubProfile}
                  isLoading={isLoading}
                >
                  <Github className="h-6 w-6" /> {isLoading ? "Redirecting..." : "Connect GitHub Account"}
                </Button>
                <div className="flex flex-col gap-2 pt-4">
                  <button 
                    onClick={() => setStep(3)} 
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors font-medium"
                  >
                    I'll do this later
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
