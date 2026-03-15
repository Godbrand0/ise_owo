import { uintCV, fetchCallReadOnlyFunction, cvToJSON, principalCV } from "@stacks/transactions";
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from "../lib/constants.js";
import { supabase } from "../db.js";

export const getTaskCounter = async () => {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-task-counter",
            functionArgs: [],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });
        return Number((cvToJSON(result) as any).value);
    } catch (e) {
        console.error("Error fetching task counter:", e);
        return 0;
    }
};

export const getTask = async (taskId: number) => {
    try {
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
    } catch (e) {
        return null;
    }
};

export const getUser = async (address: string) => {
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: "get-user",
            functionArgs: [principalCV(address)],
            network: NETWORK,
            senderAddress: CONTRACT_ADDRESS,
        });
        const data = cvToJSON(result).value;
        return data ? data.value : null;
    } catch (e) {
        return null;
    }
};

export const syncBlockchainData = async () => {
    console.log("Starting blockchain synchronization...");
    const counter = await getTaskCounter();
    console.log(`Found ${counter} tasks on-chain.`);

    const uniqueUsers = new Set<string>();

    for (let i = 0; i < counter; i++) {
        const taskData = await getTask(i);
        if (taskData) {
            // Flatten
            const task = Object.entries(taskData).reduce((acc: any, [key, val]: [string, any]) => {
                acc[key] = val.value !== undefined ? val.value : val;
                return acc;
            }, {});

            uniqueUsers.add(task.creator);
            if (task.assignee) uniqueUsers.add(task.assignee);

            // Update tasks_metadata
            await supabase.from('tasks_metadata').upsert({
                task_id: i,
                github_link: task.githubLink,
                description_raw: task.description
            }, { onConflict: 'task_id' });
        }
    }

    console.log(`Syncing ${uniqueUsers.size} unique users...`);
    for (const address of uniqueUsers) {
        const userData = await getUser(address);
        if (userData) {
            const user = Object.entries(userData).reduce((acc: any, [key, val]: [string, any]) => {
                acc[key] = val.value !== undefined ? val.value : val;
                return acc;
            }, {});

            await supabase.from('users').upsert({
                address,
                username: user.username,
                tasks_created: Number(user.tasksCreated),
                tasks_completed: Number(user.tasksCompleted),
                total_stx_funded: user.totalFunded,
                total_usdcx_funded: 0,
                avg_tip_percent: 0,
                last_updated: new Date().toISOString()
            }, { onConflict: 'address' });
        }
    }

    console.log("Blockchain synchronization complete.");
};
