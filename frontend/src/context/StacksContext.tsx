"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { UserSession, UserData } from "@stacks/connect";
import type { StacksNetwork } from "@stacks/network";
import { APP_NAME, APP_ICON, NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from "../lib/constants";

interface StacksContextType {
  userSession: UserSession;
  userData: UserData | null;
  address: string | null;
  isConnected: boolean;
  isRegistered: boolean;
  userProfile: any | null;
  githubLinked: boolean;
  setGithubLinked: (val: boolean) => void;
  verifiedGithubUsername: string | null;
  setVerifiedGithubUsername: (username: string | null) => void;
  userRole: "creator" | "contributor" | null;
  setUserRole: (role: "creator" | "contributor" | null) => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
  network: StacksNetwork;
  refreshUserData: () => Promise<void>;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

export function StacksProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [githubLinked, setGithubLinked] = useState(false);
  const [verifiedGithubUsername, setVerifiedGithubUsername] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"creator" | "contributor" | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Preference order for finding a valid STX address
// ... (address logic omitted for brevity) ...
  const address = (userData?.profile?.stxAddress?.testnet || 
                   userData?.profile?.stxAddress?.mainnet || 
                   (typeof userData?.profile?.stxAddress === "string" ? userData.profile.stxAddress : null) ||
                   (userData as any)?.stxAddress ||
                   null);

  const refreshUserData = async () => {
    if (!address) return;
    try {
      // 1. Fetch On-chain Data
      const { fetchCallReadOnlyFunction, cvToJSON, principalCV } = await import("@stacks/transactions");
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-user",
        functionArgs: [principalCV(address)],
        network: NETWORK,
        senderAddress: address,
      });
      const data = cvToJSON(result);

      let finalProfile = null;

      if (data.value) {
        setIsRegistered(true);
        finalProfile = Object.entries(data.value.value).reduce((acc: any, [key, val]: [string, any]) => {
          acc[key] = val.value !== undefined ? val.value : val;
          return acc;
        }, {});
      } else {
        setIsRegistered(false);
      }

      // 2. Fetch Off-chain Metadata from Backend
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000"}/api/users/${address}`);
        if (res.ok) {
          const metadata = await res.json();
          setGithubLinked(!!metadata.github_username);
          setVerifiedGithubUsername(metadata.github_username || null);
          setUserRole(metadata.role);
          
          // Merge metadata into profile
          if (finalProfile) {
            finalProfile = { ...finalProfile, ...metadata };
          } else {
            finalProfile = metadata;
          }
        }
      } catch (err) {
        console.warn("Could not fetch off-chain metadata:", err);
      }

      setUserProfile(finalProfile);

    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { AppConfig, UserSession } = await import("@stacks/connect");
      const config = new AppConfig(["store_write", "publish_data"]);
      const session = new UserSession({ appConfig: config });
      setUserSession(session);
      setIsMounted(true);
      
      if (session.isUserSignedIn()) {
        setUserData(session.loadUserData());
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (address) {
      refreshUserData();
    }
  }, [address]);

  const connectWallet = async () => {
    if (!userSession) return;
    const { authenticate } = await import("@stacks/connect");
    authenticate({
      appDetails: {
        name: APP_NAME,
        icon: APP_ICON,
      },
      userSession,
      onFinish: (data) => {
        setUserData(data.userSession.loadUserData());
      },
      onCancel: () => {
        console.log("User cancelled connection");
      },
    });
  };

  const disconnectWallet = () => {
    if (!userSession) return;
    userSession.signUserOut();
    setUserData(null);
    setIsRegistered(false);
    setUserProfile(null);
    setGithubLinked(false);
    setVerifiedGithubUsername(null);
    setUserRole(null);
    window.location.reload();
  };

  const value = {
    userSession: userSession!,
    userData,
    address,
    isConnected: !!userData,
    isRegistered,
    userProfile,
    githubLinked,
    setGithubLinked,
    verifiedGithubUsername,
    setVerifiedGithubUsername,
    userRole,
    setUserRole,
    connectWallet,
    disconnectWallet,
    network: NETWORK,
    refreshUserData,
  };

  if (!isMounted) return null;

  return (
    <StacksContext.Provider value={value}>
      {children}
    </StacksContext.Provider>
  );
}

export function useStacks() {
  const context = useContext(StacksContext);
  if (context === undefined) {
    throw new Error("useStacks must be used within a StacksProvider");
  }
  return context;
}
