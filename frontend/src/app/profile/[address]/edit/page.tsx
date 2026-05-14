"use client";

import { useState, useEffect, use } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useStacks } from "@/context/StacksContext";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Github, GitPullRequest, Search, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface EditProfileProps {
  params: Promise<{ address: string }>;
}

export default function EditProfilePage({ params }: EditProfileProps) {
  const { address: pageAddress } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    address: connectedAddress, 
    isConnected,
    userProfile,
    refreshUserData,
    setVerifiedGithubUsername,
    setGithubLinked,
    setUserRole
  } = useStacks();

  const [username, setUsername] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<"creator" | "contributor" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle OAuth callback parameters
  useEffect(() => {
    const isGithubVerified = searchParams.get("github_verified") === "true";
    const githubUser = searchParams.get("username");
    
    if (isGithubVerified && githubUser) {
      setVerifiedGithubUsername(githubUser);
      setGithubInput(githubUser);
      setGithubLinked(true);
      toast.success(`GitHub account @${githubUser} verified!`);
    }
  }, [searchParams, setVerifiedGithubUsername, setGithubLinked]);

  // Security check: Ensure user is editing their own profile
  useEffect(() => {
    if (isConnected && connectedAddress !== pageAddress) {
      toast.error("You can only edit your own profile");
      router.push(`/profile/${pageAddress}`);
    }
  }, [isConnected, connectedAddress, pageAddress, router]);

  // Initial state from existing profile
  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || "");
      setGithubInput(userProfile.github_username || "");
      setSelectedRole(userProfile.role || null);
    }
  }, [userProfile]);

  const handleVerifyGithub = async () => {
    if (!isConnected || !connectedAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    // Redirect to backend OAuth initiation
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
    window.location.href = `${backendUrl}/api/auth/github?address=${connectedAddress}`;
  };

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
      const res = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: connectedAddress,
          username,
          github_username: githubInput,
          role: selectedRole
        })
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
        setUserRole(selectedRole);
        await refreshUserData();
        router.push(`/profile/${connectedAddress}`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update profile");
      }
    } catch (e) {
      toast.error("Network error saving profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Navbar />
        <Card className="max-w-md w-full border-zinc-800 bg-zinc-900 shadow-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connection Required</h2>
            <p className="text-zinc-400 mb-6">Please connect your wallet to edit your profile.</p>
            <Button onClick={() => router.push("/")} className="bg-orange-600">Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <Navbar />
      
      <main className="pt-32 px-4 mx-auto max-w-2xl">
        <Link 
          href={`/profile/${pageAddress}`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Profile
        </Link>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Edit Profile</h1>
            <p className="text-zinc-400">Update your identity and preferences on Taskify</p>
          </div>

          <Card className="border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-zinc-800 p-8">
              <CardTitle className="text-xl">Profile Details</CardTitle>
              <CardDescription>Changes will be saved to our database</CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 space-y-8">
              {/* Username Section */}
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <User className="h-4 w-4" /> Username
                </label>
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-14 bg-zinc-950 border-zinc-800 text-lg"
                  placeholder="Your username"
                />
              </div>

              {/* Role Section */}
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-zinc-800 text-[10px]">R</span> Role Preference
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedRole("contributor")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedRole === "contributor" 
                        ? "border-orange-500 bg-orange-500/10" 
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                  >
                    <GitPullRequest className={`h-5 w-5 ${selectedRole === "contributor" ? "text-orange-500" : "text-zinc-500"}`} />
                    <div>
                      <div className="font-bold">Contributor</div>
                      <div className="text-xs text-zinc-500">I build and earn</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedRole("creator")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedRole === "creator" 
                        ? "border-blue-500 bg-blue-500/10" 
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                    }`}
                  >
                    <Search className={`h-5 w-5 ${selectedRole === "creator" ? "text-blue-500" : "text-zinc-500"}`} />
                    <div>
                      <div className="font-bold">Creator</div>
                      <div className="text-xs text-zinc-500">I fund tasks</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* GitHub Section */}
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                  <Github className="h-4 w-4" /> GitHub Connection
                </label>
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    className="h-14 w-full px-6 border-zinc-800 hover:bg-zinc-800 flex items-center justify-center gap-3 font-bold"
                    onClick={handleVerifyGithub}
                    disabled={isLoading}
                  >
                    <Github className="h-5 w-5" /> 
                    {userProfile?.github_username ? "Reconnect GitHub Account" : "Connect GitHub Account"}
                  </Button>
                  {userProfile?.github_username && (
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Currently linked: @{userProfile.github_username}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <Button 
                  className="w-full h-16 text-lg font-bold bg-orange-600 hover:bg-orange-500 shadow-xl shadow-orange-900/20"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Saving Changes...</span>
                  ) : (
                    "Save Profile Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
