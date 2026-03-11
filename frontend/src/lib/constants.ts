import { createNetwork } from "@stacks/network";
import { deployments } from "./clarigen-types";

export const APP_NAME = "Taskify";
export const APP_ICON = "/favicon.ico";

// Use Testnet by default for development integration
export const NETWORK = createNetwork("testnet");

// Contract info - using placeholder if not deployed yet
export const CONTRACT_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"; // Replace with your testnet address
export const CONTRACT_NAME = "taskify";
export const CONTRACT_IDENTIFIER = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

export const STX_PRECISION = 1000000;
