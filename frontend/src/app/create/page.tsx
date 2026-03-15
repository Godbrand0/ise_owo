"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useStacks } from "@/context/StacksContext";
import { createTask } from "@/lib/contract";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Info, ArrowLeft } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function CreateTaskPage() {
// ... existing state and logic ...
  const { isConnected, address, connectWallet } = useStacks();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    githubLink: "",
    amountStx: "10",
    deadlineDays: "7",
    tipPercent: "1",
    tokenType: "STX" as "STX" | "USDCx",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      connectWallet();
      return;
    }

    setIsLoading(true);
    try {
      await createTask(
        formData.title,
        formData.description,
        formData.githubLink || null,
        Number(formData.amountStx),
        Number(formData.deadlineDays),
        Number(formData.tipPercent),
        formData.tokenType,
        address!,
        (data) => {
          toast.success("Transaction submitted!");
          console.log("TX:", data.txId);
          router.push("/");
        },
        () => {
          setIsLoading(false);
          toast.error("Transaction cancelled");
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to create task");
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen pb-20">
        <Navbar />
        
        <main className="pt-32 px-4 mx-auto max-w-3xl">
          <div className="mb-8">
            <button 
              onClick={() => router.back()} 
              className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors mb-4 gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-3xl font-bold">Post a New Bounty</h1>
            <p className="text-zinc-400 mt-2">Define the work and secure the funding.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-zinc-800">
              <CardHeader>
                <CardTitle>Task Information</CardTitle>
                <CardDescription>Tell contributors what you need help with.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    placeholder="e.g. Implement SIP-010 in Clarity" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    placeholder="Detailed requirements and acceptance criteria..." 
                    className="min-h-[150px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">GitHub Repo (Optional)</label>
                  <Input 
                    placeholder="https://github.com/..." 
                    value={formData.githubLink}
                    onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800">
              <CardHeader>
                <CardTitle>Funding & Deadline</CardTitle>
                <CardDescription>Set the reward and the time limit.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bounty Amount</label>
                  <div className="flex gap-2">
                     <Input 
                      type="number" 
                      min="1" 
                      value={formData.amountStx}
                      onChange={(e) => setFormData({ ...formData, amountStx: e.target.value })}
                      required
                      className="flex-grow"
                    />
                    <select 
                      className="w-24 bg-zinc-900 border border-zinc-800 rounded-md text-sm px-2 focus:ring-2 focus:ring-orange-600 outline-none"
                      value={formData.tokenType}
                      onChange={(e) => setFormData({...formData, tokenType: e.target.value as any})}
                    >
                      <option value="STX">STX</option>
                      <option value="USDCx">USDCx</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deadline (Days)</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={formData.deadlineDays}
                    onChange={(e) => setFormData({ ...formData, deadlineDays: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Platform Tip (%)</label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="number" 
                      min="0" 
                      max="3"
                      value={formData.tipPercent}
                      onChange={(e) => setFormData({ ...formData, tipPercent: e.target.value })}
                      required
                    />
                    <span className="text-zinc-500 text-sm whitespace-nowrap">Max 3% extra</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-600/5 border-orange-600/20">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Info className="h-4 w-4 text-orange-500" />
                <CardTitle className="text-base">Fee Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Bounty Amount</span>
                  <span>{formData.amountStx} {formData.tokenType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Platform Base Fee (2%)</span>
                  <span>{(Number(formData.amountStx) * 0.02).toFixed(2)} {formData.tokenType}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Optional Tip ({formData.tipPercent}%)</span>
                  <span>{(Number(formData.amountStx) * (Number(formData.tipPercent) / 100)).toFixed(2)} {formData.tokenType}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Total Escrow Required</span>
                  <span className="text-orange-500">
                    {(Number(formData.amountStx) * (1 + 0.02 + Number(formData.tipPercent) / 100)).toFixed(2)} {formData.tokenType}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
              <Button size="lg" type="submit" isLoading={isLoading}>
                Deploy Bounty
              </Button>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
