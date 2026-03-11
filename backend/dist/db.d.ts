declare const pool: import("pg").Pool;
export declare const query: (text: string, params?: unknown[]) => Promise<import("pg").QueryResult<any>>;
export default pool;
