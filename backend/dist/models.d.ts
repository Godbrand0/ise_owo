export declare function upsertUser(address: string, username: string): Promise<import("pg").QueryResult<any>>;
export declare function updateUserDetails(address: string, details: {
    tasks_created?: number;
    tasks_completed?: number;
    total_stx_funded?: number;
    total_usdcx_funded?: number;
    avg_tip_percent?: number;
}): Promise<import("pg").QueryResult<any>>;
export declare function getLeaderboard(limit?: number): Promise<any[]>;
