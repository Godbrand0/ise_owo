"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AppConfig, UserSession, showConnect, UserData } from "@stacks/connect";
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
  const [isMounted, setIsMounted] = useState(false);

  const appConfig = new AppConfig(["store_write", "publish_data"]);
  const userSession = new UserSession({ appConfig });

  const address = userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet || null;
  // For simnet/devnet, we might need to handle address differently if it's not in profile
  // but usually for Leather it provides both.

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
    showConnect({
      appDetails: {
        name: APP_NAME,
        icon: APP_ICON,
      },
      redirectTo: "/",
      onFinish: () => {
        const data = userSession.loadUserData();
        setUserData(data);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setUserData(null);
    setIsRegistered(false);
    setUserProfile(null);
    window.location.reload();
  };

  const value = {
    userSession,
    userData,
    address,
    isConnected: !!userData,
    isRegistered,
    userProfile,
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
