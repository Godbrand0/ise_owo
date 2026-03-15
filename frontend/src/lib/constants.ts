import { createNetwork } from "@stacks/network";

export const APP_NAME = "Taskify";
export const APP_ICON = "/favicon.ico";

// Use Testnet by default for development integration
export const NETWORK = createNetwork("testnet");

// Contract info - using placeholder if not deployed yet
export const CONTRACT_ADDRESS = "ST19XTHQ3SVST2NCYPTHP2W31MFDQDBFG3W5VFJ8Z"; // Newly deployed testnet address
export const CONTRACT_NAME = "taskify";
export const CONTRACT_IDENTIFIER = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;

export const STX_PRECISION = 1000000;
