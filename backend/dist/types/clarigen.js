export const contracts = {
    sip010TraitFtStandard: {
        "functions": {},
        "maps": {},
        "variables": {},
        constants: {},
        "non_fungible_tokens": [],
        "fungible_tokens": [], "epoch": "Epoch25", "clarity_version": "Clarity2",
        contractName: 'sip-010-trait-ft-standard',
    },
    taskify: {
        "functions": {
            sumAmounts: { "name": "sum-amounts", "access": "private", "args": [{ "name": "item", "type": { "tuple": [{ "name": "address", "type": "principal" }, { "name": "amount", "type": "uint128" }] } }, { "name": "total", "type": "uint128" }], "outputs": { "type": "uint128" } },
            transferStxReward: { "name": "transfer-stx-reward", "access": "private", "args": [{ "name": "recipient", "type": { "tuple": [{ "name": "address", "type": "principal" }, { "name": "amount", "type": "uint128" }] } }, { "name": "prev-ok", "type": "bool" }], "outputs": { "type": "bool" } },
            applyForTask: { "name": "apply-for-task", "access": "public", "args": [{ "name": "task-id", "type": "uint128" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            approveAndRelease: { "name": "approve-and-release", "access": "public", "args": [{ "name": "task-id", "type": "uint128" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            assignTask: { "name": "assign-task", "access": "public", "args": [{ "name": "task-id", "type": "uint128" }, { "name": "assignee", "type": "principal" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            cancelTask: { "name": "cancel-task", "access": "public", "args": [{ "name": "task-id", "type": "uint128" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            completeTask: { "name": "complete-task", "access": "public", "args": [{ "name": "task-id", "type": "uint128" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            createTask: { "name": "create-task", "access": "public", "args": [{ "name": "title", "type": { "string-ascii": { "length": 100 } } }, { "name": "description", "type": { "string-utf8": { "length": 500 } } }, { "name": "github-link", "type": { "optional": { "string-ascii": { "length": 200 } } } }, { "name": "funding-amount", "type": "uint128" }, { "name": "deadline", "type": "uint128" }, { "name": "token-type", "type": "uint128" }, { "name": "tip-percent", "type": "uint128" }], "outputs": { "type": { "response": { "ok": "uint128", "error": "uint128" } } } },
            distributeRewards: { "name": "distribute-rewards", "access": "public", "args": [{ "name": "token-type", "type": "uint128" }, { "name": "recipients", "type": { "list": { "type": { "tuple": [{ "name": "address", "type": "principal" }, { "name": "amount", "type": "uint128" }] }, "length": 10 } } }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            markExpired: { "name": "mark-expired", "access": "public", "args": [{ "name": "task-id", "type": "uint128" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            reassignTask: { "name": "reassign-task", "access": "public", "args": [{ "name": "task-id", "type": "uint128" }, { "name": "new-assignee", "type": "principal" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            reclaimFunds: { "name": "reclaim-funds", "access": "public", "args": [{ "name": "task-id", "type": "uint128" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            registerUser: { "name": "register-user", "access": "public", "args": [{ "name": "username", "type": { "string-ascii": { "length": 50 } } }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            startTask: { "name": "start-task", "access": "public", "args": [{ "name": "task-id", "type": "uint128" }], "outputs": { "type": { "response": { "ok": "bool", "error": "uint128" } } } },
            withdrawFees: { "name": "withdraw-fees", "access": "public", "args": [{ "name": "token-type", "type": "uint128" }], "outputs": { "type": { "response": { "ok": "uint128", "error": "uint128" } } } },
            getApplicantCount: { "name": "get-applicant-count", "access": "read_only", "args": [{ "name": "task-id", "type": "uint128" }], "outputs": { "type": "uint128" } },
            getFeeInfo: { "name": "get-fee-info", "access": "read_only", "args": [], "outputs": { "type": { "tuple": [{ "name": "leaderboard-stx-pool", "type": "uint128" }, { "name": "leaderboard-usdcx-pool", "type": "uint128" }, { "name": "total-stx-fees", "type": "uint128" }, { "name": "total-usdcx-fees", "type": "uint128" }, { "name": "withdrawable-stx-fees", "type": "uint128" }, { "name": "withdrawable-usdcx-fees", "type": "uint128" }] } } },
            getTask: { "name": "get-task", "access": "read_only", "args": [{ "name": "id", "type": "uint128" }], "outputs": { "type": { "optional": { "tuple": [{ "name": "assignee", "type": { "optional": "principal" } }, { "name": "base-fee", "type": "uint128" }, { "name": "completed-at", "type": { "optional": "uint128" } }, { "name": "created-at", "type": "uint128" }, { "name": "creator", "type": "principal" }, { "name": "deadline", "type": "uint128" }, { "name": "description", "type": { "string-utf8": { "length": 500 } } }, { "name": "funding-amount", "type": "uint128" }, { "name": "github-link", "type": { "optional": { "string-ascii": { "length": 200 } } } }, { "name": "status", "type": "uint128" }, { "name": "tip-amount", "type": "uint128" }, { "name": "tip-percent", "type": "uint128" }, { "name": "title", "type": { "string-ascii": { "length": 100 } } }, { "name": "token-type", "type": "uint128" }, { "name": "total-funded", "type": "uint128" }] } } } },
            getTaskCounter: { "name": "get-task-counter", "access": "read_only", "args": [], "outputs": { "type": "uint128" } },
            getTokenType: { "name": "get-token-type", "access": "read_only", "args": [{ "name": "task-id", "type": "uint128" }], "outputs": { "type": "uint128" } },
            getUser: { "name": "get-user", "access": "read_only", "args": [{ "name": "address", "type": "principal" }], "outputs": { "type": { "optional": { "tuple": [{ "name": "registered-at", "type": "uint128" }, { "name": "tasks-completed", "type": "uint128" }, { "name": "tasks-created", "type": "uint128" }, { "name": "total-earned", "type": "uint128" }, { "name": "total-funded", "type": "uint128" }, { "name": "username", "type": { "string-ascii": { "length": 50 } } }] } } } },
            getUserByUsername: { "name": "get-user-by-username", "access": "read_only", "args": [{ "name": "name", "type": { "string-ascii": { "length": 50 } } }], "outputs": { "type": { "optional": { "tuple": [{ "name": "address", "type": "principal" }] } } } },
            hasApplied: { "name": "has-applied", "access": "read_only", "args": [{ "name": "task-id", "type": "uint128" }, { "name": "user", "type": "principal" }], "outputs": { "type": "bool" } },
            isTaskExpired: { "name": "is-task-expired", "access": "read_only", "args": [{ "name": "task-id", "type": "uint128" }], "outputs": { "type": "bool" } }
        },
        "maps": {
            taskApplicantCount: { "name": "task-applicant-count", "key": { "tuple": [{ "name": "task-id", "type": "uint128" }] }, "value": { "tuple": [{ "name": "count", "type": "uint128" }] } },
            taskApplicants: { "name": "task-applicants", "key": { "tuple": [{ "name": "applicant", "type": "principal" }, { "name": "task-id", "type": "uint128" }] }, "value": { "tuple": [{ "name": "applied-at", "type": "uint128" }] } },
            tasks: { "name": "tasks", "key": { "tuple": [{ "name": "task-id", "type": "uint128" }] }, "value": { "tuple": [{ "name": "assignee", "type": { "optional": "principal" } }, { "name": "base-fee", "type": "uint128" }, { "name": "completed-at", "type": { "optional": "uint128" } }, { "name": "created-at", "type": "uint128" }, { "name": "creator", "type": "principal" }, { "name": "deadline", "type": "uint128" }, { "name": "description", "type": { "string-utf8": { "length": 500 } } }, { "name": "funding-amount", "type": "uint128" }, { "name": "github-link", "type": { "optional": { "string-ascii": { "length": 200 } } } }, { "name": "status", "type": "uint128" }, { "name": "tip-amount", "type": "uint128" }, { "name": "tip-percent", "type": "uint128" }, { "name": "title", "type": { "string-ascii": { "length": 100 } } }, { "name": "token-type", "type": "uint128" }, { "name": "total-funded", "type": "uint128" }] } },
            usernames: { "name": "usernames", "key": { "tuple": [{ "name": "username", "type": { "string-ascii": { "length": 50 } } }] }, "value": { "tuple": [{ "name": "address", "type": "principal" }] } },
            users: { "name": "users", "key": { "tuple": [{ "name": "address", "type": "principal" }] }, "value": { "tuple": [{ "name": "registered-at", "type": "uint128" }, { "name": "tasks-completed", "type": "uint128" }, { "name": "tasks-created", "type": "uint128" }, { "name": "total-earned", "type": "uint128" }, { "name": "total-funded", "type": "uint128" }, { "name": "username", "type": { "string-ascii": { "length": 50 } } }] } }
        },
        "variables": {
            BASE_FEE_PERCENT: {
                name: 'BASE-FEE-PERCENT',
                type: 'uint128',
                access: 'constant'
            },
            CONTRACT_DEPLOYER: {
                name: 'CONTRACT-DEPLOYER',
                type: 'principal',
                access: 'constant'
            },
            ERR_ALREADY_APPLIED: {
                name: 'ERR-ALREADY-APPLIED',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_ALREADY_REGISTERED: {
                name: 'ERR-ALREADY-REGISTERED',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_DEADLINE_NOT_PASSED: {
                name: 'ERR-DEADLINE-NOT-PASSED',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_DEADLINE_PASSED: {
                name: 'ERR-DEADLINE-PASSED',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_INSUFFICIENT_FUNDS: {
                name: 'ERR-INSUFFICIENT-FUNDS',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_INVALID_STATE: {
                name: 'ERR-INVALID-STATE',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_INVALID_TIP: {
                name: 'ERR-INVALID-TIP',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_INVALID_TOKEN: {
                name: 'ERR-INVALID-TOKEN',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_NOT_APPLICANT: {
                name: 'ERR-NOT-APPLICANT',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_NOT_AUTHORIZED: {
                name: 'ERR-NOT-AUTHORIZED',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_NOT_REGISTERED: {
                name: 'ERR-NOT-REGISTERED',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_SELF_ASSIGN: {
                name: 'ERR-SELF-ASSIGN',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_TASK_NOT_FOUND: {
                name: 'ERR-TASK-NOT-FOUND',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_TRANSFER_FAILED: {
                name: 'ERR-TRANSFER-FAILED',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_USERNAME_TAKEN: {
                name: 'ERR-USERNAME-TAKEN',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            ERR_ZERO_AMOUNT: {
                name: 'ERR-ZERO-AMOUNT',
                type: {
                    response: {
                        ok: 'none',
                        error: 'uint128'
                    }
                },
                access: 'constant'
            },
            FEE_DENOMINATOR: {
                name: 'FEE-DENOMINATOR',
                type: 'uint128',
                access: 'constant'
            },
            MAX_TIP_PERCENT: {
                name: 'MAX-TIP-PERCENT',
                type: 'uint128',
                access: 'constant'
            },
            STATUS_APPROVED: {
                name: 'STATUS-APPROVED',
                type: 'uint128',
                access: 'constant'
            },
            STATUS_ASSIGNED: {
                name: 'STATUS-ASSIGNED',
                type: 'uint128',
                access: 'constant'
            },
            STATUS_CANCELLED: {
                name: 'STATUS-CANCELLED',
                type: 'uint128',
                access: 'constant'
            },
            STATUS_COMPLETED: {
                name: 'STATUS-COMPLETED',
                type: 'uint128',
                access: 'constant'
            },
            STATUS_CREATED: {
                name: 'STATUS-CREATED',
                type: 'uint128',
                access: 'constant'
            },
            STATUS_EXPIRED: {
                name: 'STATUS-EXPIRED',
                type: 'uint128',
                access: 'constant'
            },
            STATUS_FUNDS_RELEASED: {
                name: 'STATUS-FUNDS-RELEASED',
                type: 'uint128',
                access: 'constant'
            },
            STATUS_IN_PROGRESS: {
                name: 'STATUS-IN-PROGRESS',
                type: 'uint128',
                access: 'constant'
            },
            TOKEN_STX: {
                name: 'TOKEN-STX',
                type: 'uint128',
                access: 'constant'
            },
            TOKEN_USDCX: {
                name: 'TOKEN-USDCX',
                type: 'uint128',
                access: 'constant'
            },
            leaderboardStxPool: {
                name: 'leaderboard-stx-pool',
                type: 'uint128',
                access: 'variable'
            },
            leaderboardUsdcxPool: {
                name: 'leaderboard-usdcx-pool',
                type: 'uint128',
                access: 'variable'
            },
            taskCounter: {
                name: 'task-counter',
                type: 'uint128',
                access: 'variable'
            },
            totalStxFees: {
                name: 'total-stx-fees',
                type: 'uint128',
                access: 'variable'
            },
            totalUsdcxFees: {
                name: 'total-usdcx-fees',
                type: 'uint128',
                access: 'variable'
            },
            withdrawableStxFees: {
                name: 'withdrawable-stx-fees',
                type: 'uint128',
                access: 'variable'
            },
            withdrawableUsdcxFees: {
                name: 'withdrawable-usdcx-fees',
                type: 'uint128',
                access: 'variable'
            }
        },
        constants: {
            bASEFEEPERCENT: 2n,
            cONTRACTDEPLOYER: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            eRRALREADYAPPLIED: {
                isOk: false,
                value: 104n
            },
            eRRALREADYREGISTERED: {
                isOk: false,
                value: 110n
            },
            eRRDEADLINENOTPASSED: {
                isOk: false,
                value: 107n
            },
            eRRDEADLINEPASSED: {
                isOk: false,
                value: 106n
            },
            eRRINSUFFICIENTFUNDS: {
                isOk: false,
                value: 103n
            },
            eRRINVALIDSTATE: {
                isOk: false,
                value: 102n
            },
            eRRINVALIDTIP: {
                isOk: false,
                value: 105n
            },
            eRRINVALIDTOKEN: {
                isOk: false,
                value: 112n
            },
            eRRNOTAPPLICANT: {
                isOk: false,
                value: 114n
            },
            eRRNOTAUTHORIZED: {
                isOk: false,
                value: 100n
            },
            eRRNOTREGISTERED: {
                isOk: false,
                value: 111n
            },
            eRRSELFASSIGN: {
                isOk: false,
                value: 108n
            },
            eRRTASKNOTFOUND: {
                isOk: false,
                value: 101n
            },
            eRRTRANSFERFAILED: {
                isOk: false,
                value: 113n
            },
            eRRUSERNAMETAKEN: {
                isOk: false,
                value: 109n
            },
            eRRZEROAMOUNT: {
                isOk: false,
                value: 115n
            },
            fEEDENOMINATOR: 100n,
            mAXTIPPERCENT: 3n,
            sTATUSAPPROVED: 4n,
            sTATUSASSIGNED: 1n,
            sTATUSCANCELLED: 7n,
            sTATUSCOMPLETED: 3n,
            sTATUSCREATED: 0n,
            sTATUSEXPIRED: 6n,
            sTATUSFUNDSRELEASED: 5n,
            sTATUSINPROGRESS: 2n,
            tOKENSTX: 0n,
            tOKENUSDCX: 1n,
            leaderboardStxPool: 0n,
            leaderboardUsdcxPool: 0n,
            taskCounter: 0n,
            totalStxFees: 0n,
            totalUsdcxFees: 0n,
            withdrawableStxFees: 0n,
            withdrawableUsdcxFees: 0n
        },
        "non_fungible_tokens": [],
        "fungible_tokens": [], "epoch": "Epoch25", "clarity_version": "Clarity2",
        contractName: 'taskify',
    }
};
export const accounts = { "deployer": { "address": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "balance": "100000000000000" }, "faucet": { "address": "STNHKEPYEPJ8ET55ZZ0M5A34J0R3N5FM2CMMMAZ6", "balance": "100000000000000" }, "wallet_1": { "address": "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5", "balance": "100000000000000" }, "wallet_2": { "address": "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG", "balance": "100000000000000" }, "wallet_3": { "address": "ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC", "balance": "100000000000000" }, "wallet_4": { "address": "ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND", "balance": "100000000000000" }, "wallet_5": { "address": "ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB", "balance": "100000000000000" }, "wallet_6": { "address": "ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0", "balance": "100000000000000" }, "wallet_7": { "address": "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ", "balance": "100000000000000" }, "wallet_8": { "address": "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP", "balance": "100000000000000" } };
export const identifiers = { "sip010TraitFtStandard": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard", "taskify": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.taskify" };
export const simnet = {
    accounts,
    contracts,
    identifiers,
};
export const deployments = { "sip010TraitFtStandard": { "devnet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard", "simnet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip-010-trait-ft-standard", "testnet": null, "mainnet": null }, "taskify": { "devnet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.taskify", "simnet": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.taskify", "testnet": null, "mainnet": null } };
export const project = {
    contracts,
    deployments,
};
//# sourceMappingURL=clarigen.js.map