"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStacks } from "@/context/StacksContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isConnected, isRegistered, userData } = useStacks();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give the session a moment to hydrate
    const timer = setTimeout(() => {
      if (!isConnected || !isRegistered) {
        // Don't redirect if we are already on the register page
        if (pathname !== "/register") {
          router.push("/register");
        }
      }
      setIsChecking(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isConnected, isRegistered, router, pathname]);

  // While checking or if not authorized, show a skeleton or loader
  if (isChecking || !isConnected || !isRegistered) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">
            Verifying your on-chain identity...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
