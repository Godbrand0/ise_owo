import type { TypedAbiArg, TypedAbiFunction, TypedAbiMap, TypedAbiVariable, Response } from '@clarigen/core';
export declare const contracts: {
    readonly sip010TraitFtStandard: {
        readonly functions: {};
        readonly maps: {};
        readonly variables: {};
        readonly constants: {};
        readonly non_fungible_tokens: readonly [];
        readonly fungible_tokens: readonly [];
        readonly epoch: "Epoch25";
        readonly clarity_version: "Clarity2";
        readonly contractName: "sip-010-trait-ft-standard";
    };
    readonly taskify: {
        readonly functions: {
            readonly sumAmounts: TypedAbiFunction<[item: TypedAbiArg<{
                "address": string;
                "amount": number | bigint;
            }, "item">, total: TypedAbiArg<number | bigint, "total">], bigint>;
            readonly transferStxReward: TypedAbiFunction<[recipient: TypedAbiArg<{
                "address": string;
                "amount": number | bigint;
            }, "recipient">, prevOk: TypedAbiArg<boolean, "prevOk">], boolean>;
            readonly applyForTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
            readonly approveAndRelease: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
            readonly assignTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">, assignee: TypedAbiArg<string, "assignee">], Response<boolean, bigint>>;
            readonly cancelTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
            readonly completeTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
            readonly createTask: TypedAbiFunction<[title: TypedAbiArg<string, "title">, description: TypedAbiArg<string, "description">, githubLink: TypedAbiArg<string | null, "githubLink">, fundingAmount: TypedAbiArg<number | bigint, "fundingAmount">, deadline: TypedAbiArg<number | bigint, "deadline">, tokenType: TypedAbiArg<number | bigint, "tokenType">, tipPercent: TypedAbiArg<number | bigint, "tipPercent">], Response<bigint, bigint>>;
            readonly distributeRewards: TypedAbiFunction<[tokenType: TypedAbiArg<number | bigint, "tokenType">, recipients: TypedAbiArg<{
                "address": string;
                "amount": number | bigint;
            }[], "recipients">], Response<boolean, bigint>>;
            readonly markExpired: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
            readonly reassignTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">, newAssignee: TypedAbiArg<string, "newAssignee">], Response<boolean, bigint>>;
            readonly reclaimFunds: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
            readonly registerUser: TypedAbiFunction<[username: TypedAbiArg<string, "username">], Response<boolean, bigint>>;
            readonly startTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
            readonly withdrawFees: TypedAbiFunction<[tokenType: TypedAbiArg<number | bigint, "tokenType">], Response<bigint, bigint>>;
            readonly getApplicantCount: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], bigint>;
            readonly getFeeInfo: TypedAbiFunction<[], {
                "leaderboardStxPool": bigint;
                "leaderboardUsdcxPool": bigint;
                "totalStxFees": bigint;
                "totalUsdcxFees": bigint;
                "withdrawableStxFees": bigint;
                "withdrawableUsdcxFees": bigint;
            }>;
            readonly getTask: TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], {
                "assignee": string | null;
                "baseFee": bigint;
                "completedAt": bigint | null;
                "createdAt": bigint;
                "creator": string;
                "deadline": bigint;
                "description": string;
                "fundingAmount": bigint;
                "githubLink": string | null;
                "status": bigint;
                "tipAmount": bigint;
                "tipPercent": bigint;
                "title": string;
                "tokenType": bigint;
                "totalFunded": bigint;
            } | null>;
            readonly getTaskCounter: TypedAbiFunction<[], bigint>;
            readonly getTokenType: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], bigint>;
            readonly getUser: TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
                "registeredAt": bigint;
                "tasksCompleted": bigint;
                "tasksCreated": bigint;
                "totalEarned": bigint;
                "totalFunded": bigint;
                "username": string;
            } | null>;
            readonly getUserByUsername: TypedAbiFunction<[name: TypedAbiArg<string, "name">], {
                "address": string;
            } | null>;
            readonly hasApplied: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">, user: TypedAbiArg<string, "user">], boolean>;
            readonly isTaskExpired: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], boolean>;
        };
        readonly maps: {
            readonly taskApplicantCount: TypedAbiMap<{
                "taskId": number | bigint;
            }, {
                "count": bigint;
            }>;
            readonly taskApplicants: TypedAbiMap<{
                "applicant": string;
                "taskId": number | bigint;
            }, {
                "appliedAt": bigint;
            }>;
            readonly tasks: TypedAbiMap<{
                "taskId": number | bigint;
            }, {
                "assignee": string | null;
                "baseFee": bigint;
                "completedAt": bigint | null;
                "createdAt": bigint;
                "creator": string;
                "deadline": bigint;
                "description": string;
                "fundingAmount": bigint;
                "githubLink": string | null;
                "status": bigint;
                "tipAmount": bigint;
                "tipPercent": bigint;
                "title": string;
                "tokenType": bigint;
                "totalFunded": bigint;
            }>;
            readonly usernames: TypedAbiMap<{
                "username": string;
            }, {
                "address": string;
            }>;
            readonly users: TypedAbiMap<{
                "address": string;
            }, {
                "registeredAt": bigint;
                "tasksCompleted": bigint;
                "tasksCreated": bigint;
                "totalEarned": bigint;
                "totalFunded": bigint;
                "username": string;
            }>;
        };
        readonly variables: {
            readonly BASE_FEE_PERCENT: TypedAbiVariable<bigint>;
            readonly CONTRACT_DEPLOYER: TypedAbiVariable<string>;
            readonly ERR_ALREADY_APPLIED: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_ALREADY_REGISTERED: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_DEADLINE_NOT_PASSED: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_DEADLINE_PASSED: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_INSUFFICIENT_FUNDS: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_INVALID_STATE: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_INVALID_TIP: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_INVALID_TOKEN: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_NOT_APPLICANT: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_NOT_AUTHORIZED: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_NOT_REGISTERED: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_SELF_ASSIGN: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_TASK_NOT_FOUND: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_TRANSFER_FAILED: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_USERNAME_TAKEN: TypedAbiVariable<Response<null, bigint>>;
            readonly ERR_ZERO_AMOUNT: TypedAbiVariable<Response<null, bigint>>;
            readonly FEE_DENOMINATOR: TypedAbiVariable<bigint>;
            readonly MAX_TIP_PERCENT: TypedAbiVariable<bigint>;
            readonly STATUS_APPROVED: TypedAbiVariable<bigint>;
            readonly STATUS_ASSIGNED: TypedAbiVariable<bigint>;
            readonly STATUS_CANCELLED: TypedAbiVariable<bigint>;
            readonly STATUS_COMPLETED: TypedAbiVariable<bigint>;
            readonly STATUS_CREATED: TypedAbiVariable<bigint>;
            readonly STATUS_EXPIRED: TypedAbiVariable<bigint>;
            readonly STATUS_FUNDS_RELEASED: TypedAbiVariable<bigint>;
            readonly STATUS_IN_PROGRESS: TypedAbiVariable<bigint>;
            readonly TOKEN_STX: TypedAbiVariable<bigint>;
            readonly TOKEN_USDCX: TypedAbiVariable<bigint>;
            readonly leaderboardStxPool: TypedAbiVariable<bigint>;
            readonly leaderboardUsdcxPool: TypedAbiVariable<bigint>;
            readonly taskCounter: TypedAbiVariable<bigint>;
            readonly totalStxFees: TypedAbiVariable<bigint>;
            readonly totalUsdcxFees: TypedAbiVariable<bigint>;
            readonly withdrawableStxFees: TypedAbiVariable<bigint>;
            readonly withdrawableUsdcxFees: TypedAbiVariable<bigint>;
        };
        readonly constants: {
            readonly bASEFEEPERCENT: 2n;
            readonly cONTRACTDEPLOYER: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
            readonly eRRALREADYAPPLIED: {
                readonly isOk: false;
                readonly value: 104n;
            };
            readonly eRRALREADYREGISTERED: {
                readonly isOk: false;
                readonly value: 110n;
            };
            readonly eRRDEADLINENOTPASSED: {
                readonly isOk: false;
                readonly value: 107n;
            };
            readonly eRRDEADLINEPASSED: {
                readonly isOk: false;
                readonly value: 106n;
            };
            readonly eRRINSUFFICIENTFUNDS: {
                readonly isOk: false;
                readonly value: 103n;
            };
            readonly eRRINVALIDSTATE: {
                readonly isOk: false;
                readonly value: 102n;
            };
            readonly eRRINVALIDTIP: {
                readonly isOk: false;
                readonly value: 105n;
            };
            readonly eRRINVALIDTOKEN: {
                readonly isOk: false;
                readonly value: 112n;
            };
            readonly eRRNOTAPPLICANT: {
                readonly isOk: false;
                readonly value: 114n;
            };
            readonly eRRNOTAUTHORIZED: {
                readonly isOk: false;
                readonly value: 100n;
            };
            readonly eRRNOTREGISTERED: {
                readonly isOk: false;
                readonly value: 111n;
            };
            readonly eRRSELFASSIGN: {
                readonly isOk: false;
                readonly value: 108n;
            };
            readonly eRRTASKNOTFOUND: {
                readonly isOk: false;
                readonly value: 101n;
            };
            readonly eRRTRANSFERFAILED: {
                readonly isOk: false;
                readonly value: 113n;
            };
            readonly eRRUSERNAMETAKEN: {
                readonly isOk: false;
                readonly value: 109n;
            };
            readonly eRRZEROAMOUNT: {
                readonly isOk: false;
                readonly value: 115n;
            };
            readonly fEEDENOMINATOR: 100n;
            readonly mAXTIPPERCENT: 3n;
            readonly sTATUSAPPROVED: 4n;
            readonly sTATUSASSIGNED: 1n;
            readonly sTATUSCANCELLED: 7n;
            readonly sTATUSCOMPLETED: 3n;
            readonly sTATUSCREATED: 0n;
            readonly sTATUSEXPIRED: 6n;
            readonly sTATUSFUNDSRELEASED: 5n;
            readonly sTATUSINPROGRESS: 2n;
            readonly tOKENSTX: 0n;
            readonly tOKENUSDCX: 1n;
            readonly leaderboardStxPool: 0n;
            readonly leaderboardUsdcxPool: 0n;
            readonly taskCounter: 0n;
            readonly totalStxFees: 0n;
            readonly totalUsdcxFees: 0n;
            readonly withdrawableStxFees: 0n;
            readonly withdrawableUsdcxFees: 0n;
        };
        readonly non_fungible_tokens: readonly [];
        readonly fungible_tokens: readonly [];
        readonly epoch: "Epoch25";
        readonly clarity_version: "Clarity2";
        readonly contractName: "taskify";
    };
};
export declare const accounts: {
    readonly deployer: {
        readonly address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
        readonly balance: "100000000000000";
    };
    readonly faucet: {
        readonly address: "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6";
        readonly balance: "100000000000000";
    };
    readonly wallet_1: {
        readonly address: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
        readonly balance: "100000000000000";
    };
    readonly wallet_2: {
        readonly address: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";
        readonly balance: "100000000000000";
    };
    readonly wallet_3: {
        readonly address: "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC";
        readonly balance: "100000000000000";
    };
    readonly wallet_4: {
        readonly address: "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND";
        readonly balance: "100000000000000";
    };
    readonly wallet_5: {
        readonly address: "ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB";
        readonly balance: "100000000000000";
    };
    readonly wallet_6: {
        readonly address: "ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0";
        readonly balance: "100000000000000";
    };
    readonly wallet_7: {
        readonly address: "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ";
        readonly balance: "100000000000000";
    };
    readonly wallet_8: {
        readonly address: "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP";
        readonly balance: "100000000000000";
    };
};
export declare const identifiers: {
    readonly sip010TraitFtStandard: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard";
    readonly taskify: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.taskify";
};
export declare const simnet: {
    readonly accounts: {
        readonly deployer: {
            readonly address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
            readonly balance: "100000000000000";
        };
        readonly faucet: {
            readonly address: "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6";
            readonly balance: "100000000000000";
        };
        readonly wallet_1: {
            readonly address: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5";
            readonly balance: "100000000000000";
        };
        readonly wallet_2: {
            readonly address: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";
            readonly balance: "100000000000000";
        };
        readonly wallet_3: {
            readonly address: "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC";
            readonly balance: "100000000000000";
        };
        readonly wallet_4: {
            readonly address: "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND";
            readonly balance: "100000000000000";
        };
        readonly wallet_5: {
            readonly address: "ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB";
            readonly balance: "100000000000000";
        };
        readonly wallet_6: {
            readonly address: "ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0";
            readonly balance: "100000000000000";
        };
        readonly wallet_7: {
            readonly address: "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ";
            readonly balance: "100000000000000";
        };
        readonly wallet_8: {
            readonly address: "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP";
            readonly balance: "100000000000000";
        };
    };
    readonly contracts: {
        readonly sip010TraitFtStandard: {
            readonly functions: {};
            readonly maps: {};
            readonly variables: {};
            readonly constants: {};
            readonly non_fungible_tokens: readonly [];
            readonly fungible_tokens: readonly [];
            readonly epoch: "Epoch25";
            readonly clarity_version: "Clarity2";
            readonly contractName: "sip-010-trait-ft-standard";
        };
        readonly taskify: {
            readonly functions: {
                readonly sumAmounts: TypedAbiFunction<[item: TypedAbiArg<{
                    "address": string;
                    "amount": number | bigint;
                }, "item">, total: TypedAbiArg<number | bigint, "total">], bigint>;
                readonly transferStxReward: TypedAbiFunction<[recipient: TypedAbiArg<{
                    "address": string;
                    "amount": number | bigint;
                }, "recipient">, prevOk: TypedAbiArg<boolean, "prevOk">], boolean>;
                readonly applyForTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly approveAndRelease: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly assignTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">, assignee: TypedAbiArg<string, "assignee">], Response<boolean, bigint>>;
                readonly cancelTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly completeTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly createTask: TypedAbiFunction<[title: TypedAbiArg<string, "title">, description: TypedAbiArg<string, "description">, githubLink: TypedAbiArg<string | null, "githubLink">, fundingAmount: TypedAbiArg<number | bigint, "fundingAmount">, deadline: TypedAbiArg<number | bigint, "deadline">, tokenType: TypedAbiArg<number | bigint, "tokenType">, tipPercent: TypedAbiArg<number | bigint, "tipPercent">], Response<bigint, bigint>>;
                readonly distributeRewards: TypedAbiFunction<[tokenType: TypedAbiArg<number | bigint, "tokenType">, recipients: TypedAbiArg<{
                    "address": string;
                    "amount": number | bigint;
                }[], "recipients">], Response<boolean, bigint>>;
                readonly markExpired: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly reassignTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">, newAssignee: TypedAbiArg<string, "newAssignee">], Response<boolean, bigint>>;
                readonly reclaimFunds: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly registerUser: TypedAbiFunction<[username: TypedAbiArg<string, "username">], Response<boolean, bigint>>;
                readonly startTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly withdrawFees: TypedAbiFunction<[tokenType: TypedAbiArg<number | bigint, "tokenType">], Response<bigint, bigint>>;
                readonly getApplicantCount: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], bigint>;
                readonly getFeeInfo: TypedAbiFunction<[], {
                    "leaderboardStxPool": bigint;
                    "leaderboardUsdcxPool": bigint;
                    "totalStxFees": bigint;
                    "totalUsdcxFees": bigint;
                    "withdrawableStxFees": bigint;
                    "withdrawableUsdcxFees": bigint;
                }>;
                readonly getTask: TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], {
                    "assignee": string | null;
                    "baseFee": bigint;
                    "completedAt": bigint | null;
                    "createdAt": bigint;
                    "creator": string;
                    "deadline": bigint;
                    "description": string;
                    "fundingAmount": bigint;
                    "githubLink": string | null;
                    "status": bigint;
                    "tipAmount": bigint;
                    "tipPercent": bigint;
                    "title": string;
                    "tokenType": bigint;
                    "totalFunded": bigint;
                } | null>;
                readonly getTaskCounter: TypedAbiFunction<[], bigint>;
                readonly getTokenType: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], bigint>;
                readonly getUser: TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
                    "registeredAt": bigint;
                    "tasksCompleted": bigint;
                    "tasksCreated": bigint;
                    "totalEarned": bigint;
                    "totalFunded": bigint;
                    "username": string;
                } | null>;
                readonly getUserByUsername: TypedAbiFunction<[name: TypedAbiArg<string, "name">], {
                    "address": string;
                } | null>;
                readonly hasApplied: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">, user: TypedAbiArg<string, "user">], boolean>;
                readonly isTaskExpired: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], boolean>;
            };
            readonly maps: {
                readonly taskApplicantCount: TypedAbiMap<{
                    "taskId": number | bigint;
                }, {
                    "count": bigint;
                }>;
                readonly taskApplicants: TypedAbiMap<{
                    "applicant": string;
                    "taskId": number | bigint;
                }, {
                    "appliedAt": bigint;
                }>;
                readonly tasks: TypedAbiMap<{
                    "taskId": number | bigint;
                }, {
                    "assignee": string | null;
                    "baseFee": bigint;
                    "completedAt": bigint | null;
                    "createdAt": bigint;
                    "creator": string;
                    "deadline": bigint;
                    "description": string;
                    "fundingAmount": bigint;
                    "githubLink": string | null;
                    "status": bigint;
                    "tipAmount": bigint;
                    "tipPercent": bigint;
                    "title": string;
                    "tokenType": bigint;
                    "totalFunded": bigint;
                }>;
                readonly usernames: TypedAbiMap<{
                    "username": string;
                }, {
                    "address": string;
                }>;
                readonly users: TypedAbiMap<{
                    "address": string;
                }, {
                    "registeredAt": bigint;
                    "tasksCompleted": bigint;
                    "tasksCreated": bigint;
                    "totalEarned": bigint;
                    "totalFunded": bigint;
                    "username": string;
                }>;
            };
            readonly variables: {
                readonly BASE_FEE_PERCENT: TypedAbiVariable<bigint>;
                readonly CONTRACT_DEPLOYER: TypedAbiVariable<string>;
                readonly ERR_ALREADY_APPLIED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_ALREADY_REGISTERED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_DEADLINE_NOT_PASSED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_DEADLINE_PASSED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_INSUFFICIENT_FUNDS: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_INVALID_STATE: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_INVALID_TIP: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_INVALID_TOKEN: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_NOT_APPLICANT: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_NOT_AUTHORIZED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_NOT_REGISTERED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_SELF_ASSIGN: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_TASK_NOT_FOUND: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_TRANSFER_FAILED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_USERNAME_TAKEN: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_ZERO_AMOUNT: TypedAbiVariable<Response<null, bigint>>;
                readonly FEE_DENOMINATOR: TypedAbiVariable<bigint>;
                readonly MAX_TIP_PERCENT: TypedAbiVariable<bigint>;
                readonly STATUS_APPROVED: TypedAbiVariable<bigint>;
                readonly STATUS_ASSIGNED: TypedAbiVariable<bigint>;
                readonly STATUS_CANCELLED: TypedAbiVariable<bigint>;
                readonly STATUS_COMPLETED: TypedAbiVariable<bigint>;
                readonly STATUS_CREATED: TypedAbiVariable<bigint>;
                readonly STATUS_EXPIRED: TypedAbiVariable<bigint>;
                readonly STATUS_FUNDS_RELEASED: TypedAbiVariable<bigint>;
                readonly STATUS_IN_PROGRESS: TypedAbiVariable<bigint>;
                readonly TOKEN_STX: TypedAbiVariable<bigint>;
                readonly TOKEN_USDCX: TypedAbiVariable<bigint>;
                readonly leaderboardStxPool: TypedAbiVariable<bigint>;
                readonly leaderboardUsdcxPool: TypedAbiVariable<bigint>;
                readonly taskCounter: TypedAbiVariable<bigint>;
                readonly totalStxFees: TypedAbiVariable<bigint>;
                readonly totalUsdcxFees: TypedAbiVariable<bigint>;
                readonly withdrawableStxFees: TypedAbiVariable<bigint>;
                readonly withdrawableUsdcxFees: TypedAbiVariable<bigint>;
            };
            readonly constants: {
                readonly bASEFEEPERCENT: 2n;
                readonly cONTRACTDEPLOYER: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
                readonly eRRALREADYAPPLIED: {
                    readonly isOk: false;
                    readonly value: 104n;
                };
                readonly eRRALREADYREGISTERED: {
                    readonly isOk: false;
                    readonly value: 110n;
                };
                readonly eRRDEADLINENOTPASSED: {
                    readonly isOk: false;
                    readonly value: 107n;
                };
                readonly eRRDEADLINEPASSED: {
                    readonly isOk: false;
                    readonly value: 106n;
                };
                readonly eRRINSUFFICIENTFUNDS: {
                    readonly isOk: false;
                    readonly value: 103n;
                };
                readonly eRRINVALIDSTATE: {
                    readonly isOk: false;
                    readonly value: 102n;
                };
                readonly eRRINVALIDTIP: {
                    readonly isOk: false;
                    readonly value: 105n;
                };
                readonly eRRINVALIDTOKEN: {
                    readonly isOk: false;
                    readonly value: 112n;
                };
                readonly eRRNOTAPPLICANT: {
                    readonly isOk: false;
                    readonly value: 114n;
                };
                readonly eRRNOTAUTHORIZED: {
                    readonly isOk: false;
                    readonly value: 100n;
                };
                readonly eRRNOTREGISTERED: {
                    readonly isOk: false;
                    readonly value: 111n;
                };
                readonly eRRSELFASSIGN: {
                    readonly isOk: false;
                    readonly value: 108n;
                };
                readonly eRRTASKNOTFOUND: {
                    readonly isOk: false;
                    readonly value: 101n;
                };
                readonly eRRTRANSFERFAILED: {
                    readonly isOk: false;
                    readonly value: 113n;
                };
                readonly eRRUSERNAMETAKEN: {
                    readonly isOk: false;
                    readonly value: 109n;
                };
                readonly eRRZEROAMOUNT: {
                    readonly isOk: false;
                    readonly value: 115n;
                };
                readonly fEEDENOMINATOR: 100n;
                readonly mAXTIPPERCENT: 3n;
                readonly sTATUSAPPROVED: 4n;
                readonly sTATUSASSIGNED: 1n;
                readonly sTATUSCANCELLED: 7n;
                readonly sTATUSCOMPLETED: 3n;
                readonly sTATUSCREATED: 0n;
                readonly sTATUSEXPIRED: 6n;
                readonly sTATUSFUNDSRELEASED: 5n;
                readonly sTATUSINPROGRESS: 2n;
                readonly tOKENSTX: 0n;
                readonly tOKENUSDCX: 1n;
                readonly leaderboardStxPool: 0n;
                readonly leaderboardUsdcxPool: 0n;
                readonly taskCounter: 0n;
                readonly totalStxFees: 0n;
                readonly totalUsdcxFees: 0n;
                readonly withdrawableStxFees: 0n;
                readonly withdrawableUsdcxFees: 0n;
            };
            readonly non_fungible_tokens: readonly [];
            readonly fungible_tokens: readonly [];
            readonly epoch: "Epoch25";
            readonly clarity_version: "Clarity2";
            readonly contractName: "taskify";
        };
    };
    readonly identifiers: {
        readonly sip010TraitFtStandard: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard";
        readonly taskify: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.taskify";
    };
};
export declare const deployments: {
    readonly sip010TraitFtStandard: {
        readonly devnet: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard";
        readonly simnet: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard";
        readonly testnet: null;
        readonly mainnet: null;
    };
    readonly taskify: {
        readonly devnet: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.taskify";
        readonly simnet: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.taskify";
        readonly testnet: null;
        readonly mainnet: null;
    };
};
export declare const project: {
    readonly contracts: {
        readonly sip010TraitFtStandard: {
            readonly functions: {};
            readonly maps: {};
            readonly variables: {};
            readonly constants: {};
            readonly non_fungible_tokens: readonly [];
            readonly fungible_tokens: readonly [];
            readonly epoch: "Epoch25";
            readonly clarity_version: "Clarity2";
            readonly contractName: "sip-010-trait-ft-standard";
        };
        readonly taskify: {
            readonly functions: {
                readonly sumAmounts: TypedAbiFunction<[item: TypedAbiArg<{
                    "address": string;
                    "amount": number | bigint;
                }, "item">, total: TypedAbiArg<number | bigint, "total">], bigint>;
                readonly transferStxReward: TypedAbiFunction<[recipient: TypedAbiArg<{
                    "address": string;
                    "amount": number | bigint;
                }, "recipient">, prevOk: TypedAbiArg<boolean, "prevOk">], boolean>;
                readonly applyForTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly approveAndRelease: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly assignTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">, assignee: TypedAbiArg<string, "assignee">], Response<boolean, bigint>>;
                readonly cancelTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly completeTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly createTask: TypedAbiFunction<[title: TypedAbiArg<string, "title">, description: TypedAbiArg<string, "description">, githubLink: TypedAbiArg<string | null, "githubLink">, fundingAmount: TypedAbiArg<number | bigint, "fundingAmount">, deadline: TypedAbiArg<number | bigint, "deadline">, tokenType: TypedAbiArg<number | bigint, "tokenType">, tipPercent: TypedAbiArg<number | bigint, "tipPercent">], Response<bigint, bigint>>;
                readonly distributeRewards: TypedAbiFunction<[tokenType: TypedAbiArg<number | bigint, "tokenType">, recipients: TypedAbiArg<{
                    "address": string;
                    "amount": number | bigint;
                }[], "recipients">], Response<boolean, bigint>>;
                readonly markExpired: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly reassignTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">, newAssignee: TypedAbiArg<string, "newAssignee">], Response<boolean, bigint>>;
                readonly reclaimFunds: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly registerUser: TypedAbiFunction<[username: TypedAbiArg<string, "username">], Response<boolean, bigint>>;
                readonly startTask: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], Response<boolean, bigint>>;
                readonly withdrawFees: TypedAbiFunction<[tokenType: TypedAbiArg<number | bigint, "tokenType">], Response<bigint, bigint>>;
                readonly getApplicantCount: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], bigint>;
                readonly getFeeInfo: TypedAbiFunction<[], {
                    "leaderboardStxPool": bigint;
                    "leaderboardUsdcxPool": bigint;
                    "totalStxFees": bigint;
                    "totalUsdcxFees": bigint;
                    "withdrawableStxFees": bigint;
                    "withdrawableUsdcxFees": bigint;
                }>;
                readonly getTask: TypedAbiFunction<[id: TypedAbiArg<number | bigint, "id">], {
                    "assignee": string | null;
                    "baseFee": bigint;
                    "completedAt": bigint | null;
                    "createdAt": bigint;
                    "creator": string;
                    "deadline": bigint;
                    "description": string;
                    "fundingAmount": bigint;
                    "githubLink": string | null;
                    "status": bigint;
                    "tipAmount": bigint;
                    "tipPercent": bigint;
                    "title": string;
                    "tokenType": bigint;
                    "totalFunded": bigint;
                } | null>;
                readonly getTaskCounter: TypedAbiFunction<[], bigint>;
                readonly getTokenType: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], bigint>;
                readonly getUser: TypedAbiFunction<[address: TypedAbiArg<string, "address">], {
                    "registeredAt": bigint;
                    "tasksCompleted": bigint;
                    "tasksCreated": bigint;
                    "totalEarned": bigint;
                    "totalFunded": bigint;
                    "username": string;
                } | null>;
                readonly getUserByUsername: TypedAbiFunction<[name: TypedAbiArg<string, "name">], {
                    "address": string;
                } | null>;
                readonly hasApplied: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">, user: TypedAbiArg<string, "user">], boolean>;
                readonly isTaskExpired: TypedAbiFunction<[taskId: TypedAbiArg<number | bigint, "taskId">], boolean>;
            };
            readonly maps: {
                readonly taskApplicantCount: TypedAbiMap<{
                    "taskId": number | bigint;
                }, {
                    "count": bigint;
                }>;
                readonly taskApplicants: TypedAbiMap<{
                    "applicant": string;
                    "taskId": number | bigint;
                }, {
                    "appliedAt": bigint;
                }>;
                readonly tasks: TypedAbiMap<{
                    "taskId": number | bigint;
                }, {
                    "assignee": string | null;
                    "baseFee": bigint;
                    "completedAt": bigint | null;
                    "createdAt": bigint;
                    "creator": string;
                    "deadline": bigint;
                    "description": string;
                    "fundingAmount": bigint;
                    "githubLink": string | null;
                    "status": bigint;
                    "tipAmount": bigint;
                    "tipPercent": bigint;
                    "title": string;
                    "tokenType": bigint;
                    "totalFunded": bigint;
                }>;
                readonly usernames: TypedAbiMap<{
                    "username": string;
                }, {
                    "address": string;
                }>;
                readonly users: TypedAbiMap<{
                    "address": string;
                }, {
                    "registeredAt": bigint;
                    "tasksCompleted": bigint;
                    "tasksCreated": bigint;
                    "totalEarned": bigint;
                    "totalFunded": bigint;
                    "username": string;
                }>;
            };
            readonly variables: {
                readonly BASE_FEE_PERCENT: TypedAbiVariable<bigint>;
                readonly CONTRACT_DEPLOYER: TypedAbiVariable<string>;
                readonly ERR_ALREADY_APPLIED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_ALREADY_REGISTERED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_DEADLINE_NOT_PASSED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_DEADLINE_PASSED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_INSUFFICIENT_FUNDS: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_INVALID_STATE: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_INVALID_TIP: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_INVALID_TOKEN: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_NOT_APPLICANT: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_NOT_AUTHORIZED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_NOT_REGISTERED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_SELF_ASSIGN: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_TASK_NOT_FOUND: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_TRANSFER_FAILED: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_USERNAME_TAKEN: TypedAbiVariable<Response<null, bigint>>;
                readonly ERR_ZERO_AMOUNT: TypedAbiVariable<Response<null, bigint>>;
                readonly FEE_DENOMINATOR: TypedAbiVariable<bigint>;
                readonly MAX_TIP_PERCENT: TypedAbiVariable<bigint>;
                readonly STATUS_APPROVED: TypedAbiVariable<bigint>;
                readonly STATUS_ASSIGNED: TypedAbiVariable<bigint>;
                readonly STATUS_CANCELLED: TypedAbiVariable<bigint>;
                readonly STATUS_COMPLETED: TypedAbiVariable<bigint>;
                readonly STATUS_CREATED: TypedAbiVariable<bigint>;
                readonly STATUS_EXPIRED: TypedAbiVariable<bigint>;
                readonly STATUS_FUNDS_RELEASED: TypedAbiVariable<bigint>;
                readonly STATUS_IN_PROGRESS: TypedAbiVariable<bigint>;
                readonly TOKEN_STX: TypedAbiVariable<bigint>;
                readonly TOKEN_USDCX: TypedAbiVariable<bigint>;
                readonly leaderboardStxPool: TypedAbiVariable<bigint>;
                readonly leaderboardUsdcxPool: TypedAbiVariable<bigint>;
                readonly taskCounter: TypedAbiVariable<bigint>;
                readonly totalStxFees: TypedAbiVariable<bigint>;
                readonly totalUsdcxFees: TypedAbiVariable<bigint>;
                readonly withdrawableStxFees: TypedAbiVariable<bigint>;
                readonly withdrawableUsdcxFees: TypedAbiVariable<bigint>;
            };
            readonly constants: {
                readonly bASEFEEPERCENT: 2n;
                readonly cONTRACTDEPLOYER: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
                readonly eRRALREADYAPPLIED: {
                    readonly isOk: false;
                    readonly value: 104n;
                };
                readonly eRRALREADYREGISTERED: {
                    readonly isOk: false;
                    readonly value: 110n;
                };
                readonly eRRDEADLINENOTPASSED: {
                    readonly isOk: false;
                    readonly value: 107n;
                };
                readonly eRRDEADLINEPASSED: {
                    readonly isOk: false;
                    readonly value: 106n;
                };
                readonly eRRINSUFFICIENTFUNDS: {
                    readonly isOk: false;
                    readonly value: 103n;
                };
                readonly eRRINVALIDSTATE: {
                    readonly isOk: false;
                    readonly value: 102n;
                };
                readonly eRRINVALIDTIP: {
                    readonly isOk: false;
                    readonly value: 105n;
                };
                readonly eRRINVALIDTOKEN: {
                    readonly isOk: false;
                    readonly value: 112n;
                };
                readonly eRRNOTAPPLICANT: {
                    readonly isOk: false;
                    readonly value: 114n;
                };
                readonly eRRNOTAUTHORIZED: {
                    readonly isOk: false;
                    readonly value: 100n;
                };
                readonly eRRNOTREGISTERED: {
                    readonly isOk: false;
                    readonly value: 111n;
                };
                readonly eRRSELFASSIGN: {
                    readonly isOk: false;
                    readonly value: 108n;
                };
                readonly eRRTASKNOTFOUND: {
                    readonly isOk: false;
                    readonly value: 101n;
                };
                readonly eRRTRANSFERFAILED: {
                    readonly isOk: false;
                    readonly value: 113n;
                };
                readonly eRRUSERNAMETAKEN: {
                    readonly isOk: false;
                    readonly value: 109n;
                };
                readonly eRRZEROAMOUNT: {
                    readonly isOk: false;
                    readonly value: 115n;
                };
                readonly fEEDENOMINATOR: 100n;
                readonly mAXTIPPERCENT: 3n;
                readonly sTATUSAPPROVED: 4n;
                readonly sTATUSASSIGNED: 1n;
                readonly sTATUSCANCELLED: 7n;
                readonly sTATUSCOMPLETED: 3n;
                readonly sTATUSCREATED: 0n;
                readonly sTATUSEXPIRED: 6n;
                readonly sTATUSFUNDSRELEASED: 5n;
                readonly sTATUSINPROGRESS: 2n;
                readonly tOKENSTX: 0n;
                readonly tOKENUSDCX: 1n;
                readonly leaderboardStxPool: 0n;
                readonly leaderboardUsdcxPool: 0n;
                readonly taskCounter: 0n;
                readonly totalStxFees: 0n;
                readonly totalUsdcxFees: 0n;
                readonly withdrawableStxFees: 0n;
                readonly withdrawableUsdcxFees: 0n;
            };
            readonly non_fungible_tokens: readonly [];
            readonly fungible_tokens: readonly [];
            readonly epoch: "Epoch25";
            readonly clarity_version: "Clarity2";
            readonly contractName: "taskify";
        };
    };
    readonly deployments: {
        readonly sip010TraitFtStandard: {
            readonly devnet: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard";
            readonly simnet: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard";
            readonly testnet: null;
            readonly mainnet: null;
        };
        readonly taskify: {
            readonly devnet: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.taskify";
            readonly simnet: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.taskify";
            readonly testnet: null;
            readonly mainnet: null;
        };
    };
};
