import { createNetwork } from "@stacks/network";
export const NETWORK = createNetwork(process.env.STACKS_NETWORK || "testnet");
export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "ST19XTHQ3SVST2NCYPTHP2W31MFDQDBFG3W5VFJ8Z";
export const CONTRACT_NAME = "taskify";
export const CONTRACT_IDENTIFIER = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
//# sourceMappingURL=constants.js.map