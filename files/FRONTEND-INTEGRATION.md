# Taskify — Frontend Integration Guide (Stacks)

## Overview

This document covers the frontend changes needed to migrate from Stellar to Stacks. The React/Vite/TypeScript/Tailwind v4 stack remains the same — the changes are in the wallet layer, blockchain service layer, and contract interaction patterns.

---

## Dependencies

### Remove (Stellar)
```json
{
  "@stellar/wallet-kit": "remove",
  "stellar-sdk": "remove",
  "@stellar/freighter-api": "remove"
}
```

### Add (Stacks)
```json
{
  "@stacks/connect": "^7.x",
  "@stacks/transactions": "^6.x",
  "@stacks/network": "^6.x",
  "@stacks/stacks-blockchain-api-types": "latest"
}
```

---

## Wallet Integration (Stacks Connect)

### WalletProvider.tsx — Replace Stellar Wallet Kit

```typescript
import { AppConfig, UserSession, showConnect } from "@stacks/connect";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  userSession: UserSession;
  network: "mainnet" | "testnet";
}

// Connect wallet
const connectWallet = () => {
  showConnect({
    appDetails: {
      name: "Taskify",
      icon: "/logo.png",
    },
    onFinish: () => {
      // User is now authenticated
      const userData = userSession.loadUserData();
      const address = userData.profile.stxAddress[network]; // mainnet or testnet
    },
    userSession,
  });
};

// Disconnect
const disconnectWallet = () => {
  userSession.signUserOut();
};

// Check connection
const isConnected = userSession.isUserSignedIn();
```

### Key Differences from Stellar
| Stellar | Stacks |
|---|---|
| `walletKit.getAddress()` | `userSession.loadUserData().profile.stxAddress.mainnet` |
| `walletKit.signTransaction(tx)` | Handled automatically by `openContractCall()` |
| Freighter/Albedo/XBull | Leather/Xverse (auto-detected by Stacks Connect) |
| Network passphrase | `new StacksMainnet()` or `new StacksTestnet()` |

---

## Contract Service Layer

### taskify.ts — Replace Stellar Contract Service

```typescript
import {
  openContractCall,
  ContractCallOptions,
} from "@stacks/connect";
import {
  Cl,
  Pc,
  PostConditionMode,
  FungibleConditionCode,
  makeContractSTXPostCondition,
  createAssetInfo,
} from "@stacks/transactions";
import { StacksMainnet, StacksTestnet } from "@stacks/network";

// Configuration
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const CONTRACT_NAME = "taskify";
const USDCX_CONTRACT = "SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE";
const USDCX_NAME = "usdcx";
const NETWORK = new StacksMainnet(); // or new StacksTestnet()

// Token type constants (must match contract)
const TOKEN_STX = 0;
const TOKEN_USDCX = 1;
```

### Create Task (STX)

```typescript
async function createTaskSTX(
  title: string,
  description: string,
  githubLink: string | null,
  fundingAmount: number, // in microSTX
  deadline: number,      // block height
  tipPercent: number      // 0, 1, 2, or 3
) {
  const postConditions = [
    Pc.principal(senderAddress)
      .willSendLte(fundingAmount)
      .ustx(),
  ];

  const options: ContractCallOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-task",
    functionArgs: [
      Cl.stringAscii(title),
      Cl.stringUtf8(description),
      githubLink ? Cl.some(Cl.stringAscii(githubLink)) : Cl.none(),
      Cl.uint(fundingAmount),
      Cl.uint(deadline),
      Cl.uint(TOKEN_STX),
      Cl.uint(tipPercent),
    ],
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    network: NETWORK,
    onFinish: (data) => {
      console.log("TX ID:", data.txId);
      // Optimistic UI update here
    },
    onCancel: () => {
      console.log("User cancelled transaction");
    },
  };

  await openContractCall(options);
}
```

### Create Task (USDCx)

```typescript
async function createTaskUSDCx(
  title: string,
  description: string,
  githubLink: string | null,
  fundingAmount: number, // in micro-USDCx (6 decimals)
  deadline: number,
  tipPercent: number
) {
  // SIP-010 post-condition for USDCx
  const usdcxAsset = createAssetInfo(USDCX_CONTRACT, USDCX_NAME, "usdcx");

  const postConditions = [
    Pc.principal(senderAddress)
      .willSendLte(fundingAmount)
      .ft(usdcxAsset),
  ];

  const options: ContractCallOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-task",
    functionArgs: [
      Cl.stringAscii(title),
      Cl.stringUtf8(description),
      githubLink ? Cl.some(Cl.stringAscii(githubLink)) : Cl.none(),
      Cl.uint(fundingAmount),
      Cl.uint(deadline),
      Cl.uint(TOKEN_USDCX),
      Cl.uint(tipPercent),
    ],
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    network: NETWORK,
    onFinish: (data) => {
      console.log("TX ID:", data.txId);
    },
  };

  await openContractCall(options);
}
```

### Task Lifecycle Functions

```typescript
// Apply for a task
async function applyForTask(taskId: number) {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "apply-for-task",
    functionArgs: [Cl.uint(taskId)],
    postConditionMode: PostConditionMode.Deny,
    network: NETWORK,
    onFinish: (data) => { /* optimistic update */ },
  });
}

// Assign task (creator only)
async function assignTask(taskId: number, assignee: string) {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "assign-task",
    functionArgs: [Cl.uint(taskId), Cl.principal(assignee)],
    postConditionMode: PostConditionMode.Deny,
    network: NETWORK,
    onFinish: (data) => { /* update UI */ },
  });
}

// Start task (assignee only)
async function startTask(taskId: number) {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "start-task",
    functionArgs: [Cl.uint(taskId)],
    postConditionMode: PostConditionMode.Deny,
    network: NETWORK,
    onFinish: (data) => { /* update UI */ },
  });
}

// Complete task (assignee only)
async function completeTask(taskId: number) {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "complete-task",
    functionArgs: [Cl.uint(taskId)],
    postConditionMode: PostConditionMode.Deny,
    network: NETWORK,
    onFinish: (data) => { /* update UI */ },
  });
}

// Approve & release funds (creator only)
async function approveAndRelease(taskId: number, task: Task) {
  // Post-conditions: contract will send funds to assignee
  const postConditions = task.tokenType === TOKEN_STX
    ? [Pc.principal(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`)
        .willSendLte(task.fundingAmount).ustx()]
    : [Pc.principal(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`)
        .willSendLte(task.fundingAmount)
        .ft(createAssetInfo(USDCX_CONTRACT, USDCX_NAME, "usdcx"))];

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "approve-and-release",
    functionArgs: [Cl.uint(taskId)],
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    network: NETWORK,
    onFinish: (data) => { /* update UI */ },
  });
}

// Mark expired
async function markExpired(taskId: number) {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "mark-expired",
    functionArgs: [Cl.uint(taskId)],
    postConditionMode: PostConditionMode.Deny,
    network: NETWORK,
  });
}

// Reclaim expired funds (creator only)
async function reclaimFunds(taskId: number, task: Task) {
  const postConditions = task.tokenType === TOKEN_STX
    ? [Pc.principal(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`)
        .willSendLte(task.fundingAmount).ustx()]
    : [Pc.principal(`${CONTRACT_ADDRESS}.${CONTRACT_NAME}`)
        .willSendLte(task.fundingAmount)
        .ft(createAssetInfo(USDCX_CONTRACT, USDCX_NAME, "usdcx"))];

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "reclaim-funds",
    functionArgs: [Cl.uint(taskId)],
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    network: NETWORK,
  });
}
```

### Read-Only Calls (No Wallet Needed)

```typescript
import { callReadOnlyFunction, cvToJSON } from "@stacks/transactions";

async function getTask(taskId: number) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-task",
    functionArgs: [Cl.uint(taskId)],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS, // any address works for read-only
  });
  return cvToJSON(result);
}

async function getUserProfile(address: string) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-user",
    functionArgs: [Cl.principal(address)],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToJSON(result);
}

async function getFeeInfo() {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-fee-info",
    functionArgs: [],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToJSON(result);
}
```

---

## Hiro API for Task Listing

Since Clarity maps are not iterable, use the Hiro API to fetch task lists:

```typescript
const HIRO_API = "https://api.mainnet.hiro.so"; // or testnet

// Fetch all contract events (task-created, etc.)
async function getTaskEvents(offset = 0, limit = 50) {
  const response = await fetch(
    `${HIRO_API}/extended/v1/contract/${CONTRACT_ADDRESS}.${CONTRACT_NAME}/events?offset=${offset}&limit=${limit}`
  );
  return response.json();
}

// Fetch specific map entry
async function getTaskFromAPI(taskId: number) {
  const response = await fetch(
    `${HIRO_API}/v2/map_entry/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/tasks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Cl.serialize(Cl.tuple({ "task-id": Cl.uint(taskId) }))),
    }
  );
  return response.json();
}
```

---

## Block Height Utilities

```typescript
// Get current block height
async function getCurrentBlockHeight(): Promise<number> {
  const response = await fetch(`${HIRO_API}/v2/info`);
  const data = await response.json();
  return data.stacks_tip_height;
}

// Convert a future date to approximate block height
// Stacks blocks ~10 minutes (anchored to Bitcoin)
function dateToBlockHeight(targetDate: Date, currentBlockHeight: number): number {
  const now = Date.now();
  const diffMs = targetDate.getTime() - now;
  const diffMinutes = diffMs / (1000 * 60);
  const estimatedBlocks = Math.ceil(diffMinutes / 10);
  return currentBlockHeight + estimatedBlocks;
}

// Convert block height to approximate date
function blockHeightToDate(targetBlock: number, currentBlockHeight: number): Date {
  const blocksAway = targetBlock - currentBlockHeight;
  const minutesAway = blocksAway * 10;
  return new Date(Date.now() + minutesAway * 60 * 1000);
}
```

---

## UI Changes Needed

### Task Creation Form
- Add **token selector** (STX / USDCx radio or dropdown)
- Add **tip selector** (0%, 1%, 2%, 3% — radio buttons or slider)
- Replace unix timestamp deadline with date picker → convert to block height
- Show fee breakdown: "Base fee: X (2%) | Your tip: Y (Z%) | Contributor receives: W"
- Display amounts in human-readable format (divide microSTX by 1e6, micro-USDCx by 1e6)

### Task Cards & Details
- Show token badge (STX or USDCx) next to funding amount
- Show tip percentage if > 0 ("+ 2% creator tip")
- Convert block height deadlines to human-readable dates

### Dashboard
- Split stats by token: "Total funded: 5,200 STX + 3,100 USDCx"
- Add leaderboard section showing top 10 creators this month
- Add personal insights panel (AI-generated)

### Leaderboard Page (New)
- Monthly rankings table with score breakdown
- Current month's fee pool size
- AI-generated general insights
- Personal rank card with AI insights (when logged in)

---

## Environment Variables

```env
# Stacks Network
VITE_STACKS_NETWORK="mainnet"  # or "testnet"
VITE_STACKS_API_URL="https://api.mainnet.hiro.so"

# Contract
VITE_CONTRACT_ADDRESS="YOUR_DEPLOYED_CONTRACT_ADDRESS"
VITE_CONTRACT_NAME="taskify"

# USDCx
VITE_USDCX_CONTRACT="SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE"
VITE_USDCX_TOKEN_NAME="usdcx"

# Platform
VITE_DEPLOYER_ADDRESS="YOUR_DEPLOYER_ADDRESS"

# AI
VITE_AI_API_KEY="your_ai_api_key"
VITE_AI_PROVIDER="claude"  # or "gemini"

# App
VITE_APP_NAME="Taskify"
```
