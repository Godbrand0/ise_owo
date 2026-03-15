import type { FinishedTxData } from "@stacks/connect";
import { 
  APP_NAME, 
  APP_ICON, 
  CONTRACT_ADDRESS, 
  CONTRACT_NAME, 
  NETWORK,
  STX_PRECISION
} from "./constants";

export const createTask = async (
  title: string,
  description: string,
  githubLink: string | null,
  amountStx: number,
  deadlineDays: number,
  tipPercent: number,
  tokenType: "STX" | "USDCx",
  userAddress: string,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  const deadlineBlocks = (deadlineDays * 144) + 10; // Extra buffer

  const baseMicro = Math.floor(amountStx * STX_PRECISION);
  const baseFee = Math.floor(baseMicro * 2 / 100);
  const tipAmount = Math.floor(baseMicro * tipPercent / 100);
  const totalFunding = baseMicro + baseFee + tipAmount;

  const postConditions = [];
  
  if (tokenType === "STX") {
    postConditions.push({
      type: 'stx-postcondition' as const,
      address: userAddress,
      condition: 'eq' as const,
      amount: BigInt(baseMicro + baseFee + tipAmount),
    });
  } else {
    const USDCX_ADDRESS = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"; 
    const USDCX_NAME = "usdcx-token";
    postConditions.push({
      type: 'ft-postcondition' as const,
      address: userAddress,
      condition: 'eq' as const,
      amount: BigInt(baseMicro + baseFee + tipAmount),
      asset: `${USDCX_ADDRESS}.${USDCX_NAME}::usdcx` as `${string}.${string}::${string}`,
    });
  }

  const { uintCV, stringAsciiCV, stringUtf8CV, someCV, noneCV, PostConditionMode, contractPrincipalCV } = await import("@stacks/transactions");
  const { openContractCall } = await import("@stacks/connect");

  const isStx = tokenType === "STX";
  const functionName = isStx ? "create-task-stx" : "create-task-usdcx";
  
  const functionArgs: any[] = [
    stringAsciiCV(title),
    stringUtf8CV(description),
    githubLink ? someCV(stringAsciiCV(githubLink)) : noneCV(),
    uintCV(totalFunding),
    uintCV(deadlineBlocks), 
    uintCV(tipPercent),
  ];

  if (!isStx) {
    // Add ft-token trait for usdcx
    functionArgs.push(contractPrincipalCV("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "usdcx-token"));
  }

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    postConditionMode: PostConditionMode.Deny,
    postConditions,
    network: NETWORK,
    appDetails: {
      name: APP_NAME,
      icon: APP_ICON,
    },
    onFinish,
    onCancel,
  });
};

export const applyForTask = async (
  taskId: number,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  const { uintCV } = await import("@stacks/transactions");
  const { openContractCall } = await import("@stacks/connect");

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "apply-for-task",
    functionArgs: [uintCV(taskId)],
    network: NETWORK,
    appDetails: { name: APP_NAME, icon: APP_ICON },
    onFinish,
    onCancel,
  });
};

export const assignTask = async (
  taskId: number,
  assignee: string,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  const { uintCV, principalCV } = await import("@stacks/transactions");
  const { openContractCall } = await import("@stacks/connect");

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "assign-task",
    functionArgs: [uintCV(taskId), principalCV(assignee)],
    network: NETWORK,
    appDetails: { name: APP_NAME, icon: APP_ICON },
    onFinish,
    onCancel,
  });
};

export const startTask = async (
  taskId: number,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  const { uintCV } = await import("@stacks/transactions");
  const { openContractCall } = await import("@stacks/connect");

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "start-task",
    functionArgs: [uintCV(taskId)],
    network: NETWORK,
    appDetails: { name: APP_NAME, icon: APP_ICON },
    onFinish,
    onCancel,
  });
};

export async function completeTask(
  taskId: number,
  onFinish?: (data: any) => void,
  onCancel?: () => void
) {
  const { uintCV } = await import("@stacks/transactions");
  const { openContractCall } = await import("@stacks/connect");

  const functionArgs = [uintCV(taskId)];

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "complete-task",
    functionArgs,
    network: NETWORK,
    appDetails: {
      name: APP_NAME,
      icon: APP_ICON,
    },
    onFinish: (data) => {
      console.log("Complete Task Transaction:", data);
      if (onFinish) onFinish(data);
    },
    onCancel: () => {
      if (onCancel) onCancel();
    },
  });
}

export const approveAndRelease = async (
  taskId: number,
  tokenType: number,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  const { uintCV, contractPrincipalCV } = await import("@stacks/transactions");
  const { openContractCall } = await import("@stacks/connect");

  const isStx = tokenType === 0;
  const functionName = isStx ? "approve-and-release-stx" : "approve-and-release-usdcx";
  const functionArgs: any[] = [uintCV(taskId)];

  if (!isStx) {
    functionArgs.push(contractPrincipalCV("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "usdcx-token"));
  }

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    network: NETWORK,
    appDetails: { name: APP_NAME, icon: APP_ICON },
    onFinish,
    onCancel,
  });
};

export const cancelTask = async (
  taskId: number,
  tokenType: number,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  const { uintCV, contractPrincipalCV } = await import("@stacks/transactions");
  const { openContractCall } = await import("@stacks/connect");

  const isStx = tokenType === 0;
  const functionName = isStx ? "cancel-task-stx" : "cancel-task-usdcx";
  const functionArgs: any[] = [uintCV(taskId)];

  if (!isStx) {
    functionArgs.push(contractPrincipalCV("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "usdcx-token"));
  }

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    network: NETWORK,
    appDetails: { name: APP_NAME, icon: APP_ICON },
    onFinish,
    onCancel,
  });
};

export const reclaimFunds = async (
  taskId: number,
  tokenType: number,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  const { uintCV, contractPrincipalCV } = await import("@stacks/transactions");
  const { openContractCall } = await import("@stacks/connect");

  const isStx = tokenType === 0;
  const functionName = isStx ? "reclaim-funds-stx" : "reclaim-funds-usdcx";
  const functionArgs: any[] = [uintCV(taskId)];

  if (!isStx) {
    functionArgs.push(contractPrincipalCV("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "usdcx-token"));
  }

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    network: NETWORK,
    appDetails: { name: APP_NAME, icon: APP_ICON },
    onFinish,
    onCancel,
  });
};


export const getTaskCounter = async () => {
  const { fetchCallReadOnlyFunction, cvToJSON } = await import("@stacks/transactions");
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-task-counter",
    functionArgs: [],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  return Number((cvToJSON(result) as any).value);
};

export const getTask = async (taskId: number) => {
  const { uintCV, fetchCallReadOnlyFunction, cvToJSON } = await import("@stacks/transactions");
  const result = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-task",
    functionArgs: [uintCV(taskId)],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  const data = cvToJSON(result).value;
  return data ? data.value : null;
};

export const fetchAllTasks = async () => {
  try {
    const counter = await getTaskCounter();
    const results = await Promise.all(
      Array.from({ length: counter }, (_, i) => getTask(i))
    );
    return results
      .map((task, i) => {
        if (!task) return null;
        const flattenedTask = Object.entries(task).reduce((acc: any, [key, val]: [string, any]) => {
          acc[key] = val.value !== undefined ? val.value : val;
          return acc;
        }, {});
        return { id: i, ...flattenedTask };
      })
      .filter(Boolean);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return [];
  }
};

export const hasApplied = async (taskId: number, userAddress: string) => {
  try {
    const { uintCV, principalCV, fetchCallReadOnlyFunction, cvToJSON } = await import("@stacks/transactions");
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "has-applied",
      functionArgs: [uintCV(taskId), principalCV(userAddress)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });
    return (cvToJSON(result) as any).value === true;
  } catch (e) {
    return false;
  }
};

export const registerUser = async (
  username: string,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  const { stringAsciiCV } = await import("@stacks/transactions");
  const { openContractCall } = await import("@stacks/connect");

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "register-user",
    functionArgs: [stringAsciiCV(username)],
    network: NETWORK,
    appDetails: { name: APP_NAME, icon: APP_ICON },
    onFinish,
    onCancel,
  });
};
