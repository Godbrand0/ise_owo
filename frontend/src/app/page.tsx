"use client";

import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { ArrowRight, Code, Layout, Share2, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useStacks } from "../context/StacksContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const features = [
  {
    title: "Secure Escrow",
    description: "Funds are locked in a smart contract and only released when the creator approves the work.",
    icon: ShieldCheck,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Multi-Token Support",
    description: "Fund tasks with STX or USDCx, giving you flexibility in how you pay contributors.",
    icon: Zap,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Transparent Rep",
    description: "Every task completed adds to your on-chain resume, building trust in the ecosystem.",
    icon: Share2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
];

export default function Home() {
  const { isConnected, connectWallet, isRegistered } = useStacks();
  const router = useRouter();

  useEffect(() => {
    // If we land here and user is not registered, send to onboarding
    // We only do this if they haven't connected yet OR they are connected but not registered
    // Actually, the request says "make /register the first page a new user sees"
    // So if they are not registered, they should go there.
    if (!isRegistered) {
      router.push("/register");
    }
  }, [isRegistered, router]);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px] animate-pulse duration-3000" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
                  The Decentralized <span className="text-orange-600">Bounty Board</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
                  Taskify connects creators with expert builders on Stacks. Create tasks, fund them safely, and grow the ecosystem together.
                </p>
                <div className="mt-10 flex items-center justify-center gap-4">
                  {isConnected ? (
                    <Link href="/create">
                      <Button size="lg" className="gap-2">
                        Create a Task <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/register">
                      <Button size="lg" className="gap-2">
                        Get Started <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  <Link href="/tasks">
                    <Button size="lg" variant="outline">
                      Explore Tasks
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-zinc-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-zinc-800">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                      <CardDescription className="text-base mt-2">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 border-t border-zinc-900">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to start building?</h2>
            <p className="text-zinc-400 mb-10 text-lg">
              Join the growing community of Stacks developers and creators.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Card className="bg-orange-600/5 border-orange-600/20 text-left p-6 sm:max-w-xs transition-shadow hover:shadow-orange-950/20">
                  <h3 className="font-bold text-lg mb-2">For Creators</h3>
                  <p className="text-sm text-zinc-400 mb-4">Post tasks, set deadlines, and fund with STX securely.</p>
                  <Link href="/create">
                    <Button variant="ghost" className="p-0 h-auto font-bold text-orange-500 hover:bg-transparent">Post a task ↗</Button>
                  </Link>
               </Card>
               <Card className="bg-blue-600/5 border-blue-600/20 text-left p-6 sm:max-w-xs transition-shadow hover:shadow-blue-950/20">
                  <h3 className="font-bold text-lg mb-2">For Builders</h3>
                  <p className="text-sm text-zinc-400 mb-4">Browse open bounties, submit work, and earn rewards directly.</p>
                  <Link href="/tasks">
                    <Button variant="ghost" className="p-0 h-auto font-bold text-blue-500 hover:bg-transparent">Browse bounties ↗</Button>
                  </Link>
               </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-zinc-900 bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-4 text-center text-zinc-500 text-sm">
          &copy; {new Date().getFullYear()} Taskify. Built on Stacks.
        </div>
      </footer>
    </div>
  );
}
