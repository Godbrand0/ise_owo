"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AppConfig, UserSession, authenticate, UserData } from "@stacks/connect";
import { uintCV, fetchCallReadOnlyFunction, cvToJSON, principalCV } from "@stacks/transactions";
import { StacksNetwork } from "@stacks/network";
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
  const [userRole, setUserRole] = useState<"creator" | "contributor" | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const appConfig = new AppConfig(["store_write", "publish_data"]);
  const userSession = new UserSession({ appConfig });

  // Prefer the address that matches the configured network so we don't send
  // a mainnet SP... address to a testnet contract (or vice versa).
  const address = (userData?.profile?.stxAddress?.testnet || 
                   userData?.profile?.stxAddress?.mainnet || 
                   (typeof userData?.profile?.stxAddress === "string" ? userData.profile.stxAddress : null) ||
                   (userData as any)?.stxAddress ||
                   null);

  console.log("Stacks Session State:", { 
    isConnected: !!userData, 
    address, 
    stxAddressObj: userData?.profile?.stxAddress 
  });

  const refreshUserData = async () => {
    if (!address) return;
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-user",
        functionArgs: [principalCV(address)],
        network: NETWORK,
        senderAddress: address,
      });
      const data = cvToJSON(result);
      if (data.value) {
        setIsRegistered(true);
        // Flatten
        const profile = Object.entries(data.value.value).reduce((acc: any, [key, val]: [string, any]) => {
          acc[key] = val.value !== undefined ? val.value : val;
          return acc;
        }, {});
        setUserProfile(profile);
      } else {
        setIsRegistered(false);
        setUserProfile(null);
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  useEffect(() => {
    if (address) {
      refreshUserData();
    }
  }, [address]);

  const connectWallet = () => {
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
    userSession.signUserOut();
    setUserData(null);
    setIsRegistered(false);
    setUserProfile(null);
    setGithubLinked(false);
    setUserRole(null);
    window.location.reload();
  };

  const value = {
    userSession,
    userData,
    address,
    isConnected: !!userData,
    isRegistered,
    userProfile,
    githubLinked,
    setGithubLinked,
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
