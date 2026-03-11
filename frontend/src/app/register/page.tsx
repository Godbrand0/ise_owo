"use client";

import { useState } from "react";
import { Navbar } from "../../components/layout/Navbar";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { useStacks } from "../../context/StacksContext";
import { registerUser } from "../../lib/contract";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { isConnected, address, connectWallet, isRegistered, refreshUserData } = useStacks();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isRegistered) {
     router.push("/");
     return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connectWallet();
      return;
    }

    setIsLoading(true);
    try {
      await registerUser(
        username,
        (data) => {
          toast.success("Registration submitted!");
          // Pulse check for registration
          const interval = setInterval(async () => {
             await refreshUserData();
             if (isRegistered) {
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
      
      <main className="pt-40 px-4 mx-auto max-w-md text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-600/10 mb-8">
           <UserPlus className="h-10 w-10 text-orange-600" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Complete your profile</h1>
        <p className="text-zinc-400 mb-10">Choose a username to start interacting with the Taskify platform.</p>

        <form onSubmit={handleSubmit} className="text-left">
          <Card className="border-zinc-800 bg-zinc-950">
            <CardHeader pb-2>
              <CardTitle className="text-lg">Username</CardTitle>
              <CardDescription>This will be your identity on Taskify.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Input 
                placeholder="e.g. SatoshiBuilder" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={50}
                className="h-12 text-lg"
              />
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest px-1">
                Linked to: <span className="font-mono text-zinc-400">{address ? address.substring(0, 8) + "..." + address.substring(address.length - 8) : "No wallet connected"}</span>
              </p>
            </CardContent>
            <div className="p-6 pt-0">
               <Button size="lg" className="w-full h-12 text-lg" type="submit" isLoading={isLoading} disabled={!isConnected}>
                 {isConnected ? "Create Profile" : "Connect Wallet First"}
               </Button>
            </div>
          </Card>
        </form>
      </main>
    </div>
  );
}
