import { uintCV, fetchCallReadOnlyFunction, cvToJSON, principalCV } from "@stacks/transactions";
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from "../lib/constants.js";
import pool from "../db.js";
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
        return Number(cvToJSON(result).value);
    }
    catch (e) {
        console.error("Error fetching task counter:", e);
        return 0;
    }
};
export const getTask = async (taskId) => {
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
    }
    catch (e) {
        return null;
    }
};
export const getUser = async (address) => {
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
    }
    catch (e) {
        return null;
    }
};
export const syncBlockchainData = async () => {
    console.log("Starting blockchain synchronization...");
    const counter = await getTaskCounter();
    console.log(`Found ${counter} tasks on-chain.`);
    const uniqueUsers = new Set();
    for (let i = 0; i < counter; i++) {
        const taskData = await getTask(i);
        if (taskData) {
            // Flatten
            const task = Object.entries(taskData).reduce((acc, [key, val]) => {
                acc[key] = val.value !== undefined ? val.value : val;
                return acc;
            }, {});
            uniqueUsers.add(task.creator);
            if (task.assignee)
                uniqueUsers.add(task.assignee);
            // Update tasks_metadata
            await pool.query(`INSERT INTO tasks_metadata (task_id, github_link, description_raw)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (task_id) DO UPDATE SET 
                    github_link = EXCLUDED.github_link,
                    description_raw = EXCLUDED.description_raw`, [i, task.githubLink, task.description]);
        }
    }
    console.log(`Syncing ${uniqueUsers.size} unique users...`);
    for (const address of uniqueUsers) {
        const userData = await getUser(address);
        if (userData) {
            const user = Object.entries(userData).reduce((acc, [key, val]) => {
                acc[key] = val.value !== undefined ? val.value : val;
                return acc;
            }, {});
            await pool.query(`INSERT INTO users (address, username, tasks_created, tasks_completed, total_stx_funded, total_usdcx_funded, avg_tip_percent)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT (address) DO UPDATE SET
                    username = EXCLUDED.username,
                    tasks_created = EXCLUDED.tasks_created,
                    tasks_completed = EXCLUDED.tasks_completed,
                    total_stx_funded = EXCLUDED.total_stx_funded,
                    total_usdcx_funded = EXCLUDED.total_usdcx_funded,
                    avg_tip_percent = EXCLUDED.avg_tip_percent,
                    last_updated = NOW()`, [
                address,
                user.username,
                Number(user.tasksCreated),
                Number(user.tasksCompleted),
                user.totalFunded, // total_stx_funded in DB
                0, // USDCx placeholder
                0 // avg_tip placeholder
            ]);
        }
    }
    console.log("Blockchain synchronization complete.");
};
//# sourceMappingURL=sync.js.map