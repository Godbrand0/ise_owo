import { 
  openContractCall,
  FinishedTxData,
} from "@stacks/connect";
import {
  uintCV,
  stringAsciiCV,
  stringUtf8CV,
  noneCV,
  someCV,
  principalCV,
  fetchCallReadOnlyFunction,
  cvToJSON,
  PostConditionMode,
} from "@stacks/transactions";
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
  userAddress: string,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  const amountMicroStacks = Math.floor(amountStx * STX_PRECISION);
  const deadlineBlocks = deadlineDays * 144; // Approx 144 blocks per day

  // Calculate total funding including base fee and tip
  const baseFee = Math.floor((amountMicroStacks * 2) / 100);
  const tipAmount = Math.floor((amountMicroStacks * tipPercent) / 100);
  const totalFunding = amountMicroStacks + baseFee + tipAmount;

  const postConditions = [
    {
      type: 'stx-postcondition' as const,
      address: userAddress,
      condition: 'eq' as const,
      amount: BigInt(totalFunding),
    },
  ];

  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-task",
    functionArgs: [
      stringAsciiCV(title),
      stringUtf8CV(description),
      githubLink ? someCV(stringAsciiCV(githubLink)) : noneCV(),
      uintCV(amountMicroStacks),
      uintCV(deadlineBlocks), 
      uintCV(0), // TOKEN-STX
      uintCV(tipPercent),
    ],
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

export const completeTask = async (
  taskId: number,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "complete-task",
    functionArgs: [uintCV(taskId)],
    network: NETWORK,
    appDetails: { name: APP_NAME, icon: APP_ICON },
    onFinish,
    onCancel,
  });
};

export const approveAndRelease = async (
  taskId: number,
  onFinish: (data: FinishedTxData) => void,
  onCancel: () => void
) => {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "approve-and-release",
    functionArgs: [uintCV(taskId)],
    network: NETWORK,
    appDetails: { name: APP_NAME, icon: APP_ICON },
    onFinish,
    onCancel,
  });
};

export const getTaskCounter = async () => {
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
    const tasks = [];
    for (let i = 0; i < counter; i++) {
      const task = await getTask(i);
      if (task) {
        // Flatten the task object from JSON structure
        const flattenedTask = Object.entries(task).reduce((acc: any, [key, val]: [string, any]) => {
          acc[key] = val.value !== undefined ? val.value : val;
          return acc;
        }, {});
        tasks.push({ id: i, ...flattenedTask });
      }
    }
    return tasks;
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return [];
  }
};

export const hasApplied = async (taskId: number, userAddress: string) => {
  try {
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
