"use client";

import { use, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { truncateAddress } from "@/lib/utils";
import { fetchCallReadOnlyFunction, cvToJSON, principalCV } from "@stacks/transactions";
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from "@/lib/constants";
import { User, CheckCircle2, LayoutGrid, Zap } from "lucide-react";
import Link from "next/link";
import { formatSTX } from "@/lib/utils";

export default function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-user",
        functionArgs: [principalCV(address)],
        network: NETWORK,
        senderAddress: CONTRACT_ADDRESS,
      });
      const data = cvToJSON(result);
      if (data.value) {
        const flattened = Object.entries(data.value.value).reduce((acc: any, [key, val]: [string, any]) => {
          acc[key] = val.value !== undefined ? val.value : val;
          return acc;
        }, {});
        setProfile(flattened);
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [address]);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <main className="pt-32 px-4 mx-auto max-w-5xl">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-8">
          <span className="text-zinc-300">Profile</span>
        </div>

        <div className="mb-10 text-center space-y-4 flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center shadow-xl">
            <User className="h-10 w-10 text-zinc-400" />
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight">
            {profile ? profile.username : truncateAddress(address)}
          </h1>
          <p className="text-zinc-500 font-mono bg-zinc-900/50 px-3 py-1 rounded-lg border border-zinc-800">
            {address}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 rounded-3xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : profile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-center items-center text-center space-y-2">
               <div className="h-10 w-10 bg-orange-600/10 text-orange-500 rounded-xl flex items-center justify-center mb-2">
                 <LayoutGrid className="h-5 w-5" />
               </div>
               <p className="text-3xl font-black text-white">{Number(profile["tasks-created"])}</p>
               <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Tasks Created</p>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-center items-center text-center space-y-2">
               <div className="h-10 w-10 bg-blue-600/10 text-blue-500 rounded-xl flex items-center justify-center mb-2">
                 <CheckCircle2 className="h-5 w-5" />
               </div>
               <p className="text-3xl font-black text-white">{Number(profile["tasks-completed"])}</p>
               <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Tasks Completed</p>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-center items-center text-center space-y-2">
               <div className="h-10 w-10 bg-green-600/10 text-green-500 rounded-xl flex items-center justify-center mb-2">
                 <Zap className="h-5 w-5" />
               </div>
               <p className="text-3xl font-black text-white">{formatSTX(profile["total-earned"])}</p>
               <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">STX Earned</p>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-center items-center text-center space-y-2">
               <div className="h-10 w-10 bg-purple-600/10 text-purple-500 rounded-xl flex items-center justify-center mb-2">
                 <Zap className="h-5 w-5" />
               </div>
               <p className="text-3xl font-black text-white">{formatSTX(profile["total-funded"])}</p>
               <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">STX Funded</p>
            </Card>
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
             <User className="h-8 w-8 text-zinc-700 mx-auto mb-4" />
             <p className="text-zinc-400">This user hasn't registered a profile yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
