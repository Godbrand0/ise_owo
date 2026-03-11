# Taskify — Clarity Smart Contract Specification

## Overview

The Taskify smart contract is written in Clarity and deployed on the Stacks blockchain. It handles task creation, escrow, lifecycle management, fee collection, and fund distribution. It supports dual-token funding (STX and USDCx).

---

## Contract Dependencies

```clarity
;; SIP-010 Fungible Token Trait
(use-trait ft-trait 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait)

;; USDCx Token Reference
;; Mainnet: SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx
;; Testnet: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx
```

---

## Constants

```clarity
;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-TASK-NOT-FOUND (err u101))
(define-constant ERR-INVALID-STATE (err u102))
(define-constant ERR-INSUFFICIENT-FUNDS (err u103))
(define-constant ERR-ALREADY-APPLIED (err u104))
(define-constant ERR-INVALID-TIP (err u105))
(define-constant ERR-DEADLINE-PASSED (err u106))
(define-constant ERR-DEADLINE-NOT-PASSED (err u107))
(define-constant ERR-SELF-ASSIGN (err u108))
(define-constant ERR-USERNAME-TAKEN (err u109))
(define-constant ERR-ALREADY-REGISTERED (err u110))
(define-constant ERR-NOT-REGISTERED (err u111))
(define-constant ERR-INVALID-TOKEN (err u112))
(define-constant ERR-TRANSFER-FAILED (err u113))
(define-constant ERR-NOT-APPLICANT (err u114))
(define-constant ERR-ZERO-AMOUNT (err u115))

;; Task status values
(define-constant STATUS-CREATED u0)
(define-constant STATUS-ASSIGNED u1)
(define-constant STATUS-IN-PROGRESS u2)
(define-constant STATUS-COMPLETED u3)
(define-constant STATUS-APPROVED u4)
(define-constant STATUS-FUNDS-RELEASED u5)
(define-constant STATUS-EXPIRED u6)
(define-constant STATUS-CANCELLED u7)

;; Token type identifiers
(define-constant TOKEN-STX u0)
(define-constant TOKEN-USDCX u1)

;; Fee configuration
(define-constant BASE-FEE-PERCENT u2)    ;; 2% base fee
(define-constant MAX-TIP-PERCENT u3)     ;; max 3% optional tip
(define-constant FEE-DENOMINATOR u100)   ;; for percentage math

;; Contract deployer (platform admin)
(define-constant CONTRACT-DEPLOYER tx-sender)
```

---

## Data Variables

```clarity
;; Auto-incrementing task ID counter
(define-data-var task-counter uint u0)

;; Total accumulated fees (tracked per token type)
(define-data-var total-stx-fees uint u0)
(define-data-var total-usdcx-fees uint u0)

;; Fees available for withdrawal (after leaderboard redistribution)
(define-data-var withdrawable-stx-fees uint u0)
(define-data-var withdrawable-usdcx-fees uint u0)

;; Leaderboard redistribution pool (20% of fees, held for monthly payout)
(define-data-var leaderboard-stx-pool uint u0)
(define-data-var leaderboard-usdcx-pool uint u0)
```

---

## Data Maps

```clarity
;; Primary task storage
(define-map tasks
  { task-id: uint }
  {
    title: (string-ascii 100),
    description: (string-utf8 500),
    github-link: (optional (string-ascii 200)),
    funding-amount: uint,           ;; amount escrowed (after fee deduction)
    total-funded: uint,             ;; original amount creator paid
    token-type: uint,               ;; TOKEN-STX or TOKEN-USDCX
    deadline: uint,                 ;; block height (not unix timestamp — Clarity uses block height)
    creator: principal,
    assignee: (optional principal),
    status: uint,
    created-at: uint,               ;; block height at creation
    completed-at: (optional uint),  ;; block height at completion
    base-fee: uint,                 ;; 2% fee amount
    tip-amount: uint,               ;; optional tip amount
    tip-percent: uint               ;; 0, 1, 2, or 3
  }
)

;; User profiles
(define-map users
  { address: principal }
  {
    username: (string-ascii 50),
    registered-at: uint,
    tasks-created: uint,
    tasks-completed: uint,
    total-funded: uint,
    total-earned: uint
  }
)

;; Username lookup (reverse mapping to enforce uniqueness)
(define-map usernames
  { username: (string-ascii 50) }
  { address: principal }
)

;; Task applicants — tracks who applied for each task
(define-map task-applicants
  { task-id: uint, applicant: principal }
  { applied-at: uint }
)

;; Applicant count per task (for efficient reads)
(define-map task-applicant-count
  { task-id: uint }
  { count: uint }
)
```

---

## Public Functions

### User Registration

```clarity
(define-public (register-user (username (string-ascii 50)))
  ;; Checks:
  ;; - Caller is not already registered
  ;; - Username is not already taken
  ;; - Username is not empty
  ;; Actions:
  ;; - Insert into users map
  ;; - Insert into usernames map (reverse lookup)
  ;; - Print event for indexing
)
```

### Task Creation

```clarity
(define-public (create-task
    (title (string-ascii 100))
    (description (string-utf8 500))
    (github-link (optional (string-ascii 200)))
    (funding-amount uint)
    (deadline uint)
    (token-type uint)
    (tip-percent uint)
  )
  ;; Checks:
  ;; - Caller is registered
  ;; - funding-amount > 0
  ;; - deadline > current block height
  ;; - token-type is TOKEN-STX or TOKEN-USDCX
  ;; - tip-percent is 0, 1, 2, or 3
  ;;
  ;; Fee calculation:
  ;;   base-fee = (funding-amount * BASE-FEE-PERCENT) / FEE-DENOMINATOR
  ;;   tip-amount = (funding-amount * tip-percent) / FEE-DENOMINATOR
  ;;   total-fee = base-fee + tip-amount
  ;;   escrow-amount = funding-amount - total-fee
  ;;
  ;; Actions:
  ;; - Transfer funding-amount from creator to contract
  ;;   → If TOKEN-STX: (stx-transfer? funding-amount tx-sender (as-contract tx-sender))
  ;;   → If TOKEN-USDCX: (contract-call? .usdcx transfer funding-amount tx-sender (as-contract tx-sender) none)
  ;; - Allocate fees:
  ;;   → 80% of total-fee → withdrawable fees (platform revenue)
  ;;   → 20% of total-fee → leaderboard pool
  ;; - Insert task into tasks map
  ;; - Increment task-counter
  ;; - Update creator's user profile (tasks-created, total-funded)
  ;; - Print task-created event
)
```

### Apply for Task

```clarity
(define-public (apply-for-task (task-id uint))
  ;; Checks:
  ;; - Task exists and status is STATUS-CREATED
  ;; - Caller is registered
  ;; - Caller is not the task creator
  ;; - Caller has not already applied
  ;; - Task deadline has not passed
  ;; Actions:
  ;; - Insert into task-applicants map
  ;; - Increment task-applicant-count
  ;; - Print task-application event
)
```

### Assign Task

```clarity
(define-public (assign-task (task-id uint) (assignee principal))
  ;; Checks:
  ;; - Caller is the task creator
  ;; - Task status is STATUS-CREATED
  ;; - Assignee has applied for this task
  ;; - Assignee is registered
  ;; Actions:
  ;; - Update task: set assignee, status → STATUS-ASSIGNED
  ;; - Print task-assigned event
)
```

### Start Task

```clarity
(define-public (start-task (task-id uint))
  ;; Checks:
  ;; - Caller is the task assignee
  ;; - Task status is STATUS-ASSIGNED
  ;; Actions:
  ;; - Update task: status → STATUS-IN-PROGRESS
  ;; - Print task-started event
)
```

### Complete Task

```clarity
(define-public (complete-task (task-id uint))
  ;; Checks:
  ;; - Caller is the task assignee
  ;; - Task status is STATUS-IN-PROGRESS
  ;; Actions:
  ;; - Update task: status → STATUS-COMPLETED, completed-at → block-height
  ;; - Print task-completed event
)
```

### Approve and Release Funds

```clarity
(define-public (approve-and-release (task-id uint))
  ;; Checks:
  ;; - Caller is the task creator
  ;; - Task status is STATUS-COMPLETED
  ;; Actions:
  ;; - Update task: status → STATUS-FUNDS-RELEASED
  ;; - Transfer escrowed funds to assignee:
  ;;   → If TOKEN-STX: (as-contract (stx-transfer? amount tx-sender assignee))
  ;;   → If TOKEN-USDCX: (as-contract (contract-call? .usdcx transfer amount tx-sender assignee none))
  ;; - Update assignee's user profile (tasks-completed, total-earned)
  ;; - Update creator's user profile (tasks-completed count)
  ;; - Print funds-released event
)
```

### Mark Task Expired

```clarity
(define-public (mark-expired (task-id uint))
  ;; Checks:
  ;; - Task exists
  ;; - Task status is STATUS-CREATED, STATUS-ASSIGNED, or STATUS-IN-PROGRESS
  ;; - Current block height > task deadline
  ;; Actions:
  ;; - Update task: status → STATUS-EXPIRED
  ;; - Print task-expired event
)
```

### Reclaim Expired Funds

```clarity
(define-public (reclaim-funds (task-id uint))
  ;; Checks:
  ;; - Caller is the task creator
  ;; - Task status is STATUS-EXPIRED
  ;; Actions:
  ;; - Transfer escrowed funds back to creator (token-aware)
  ;; - Update task: status → STATUS-CANCELLED
  ;; - Print funds-reclaimed event
)
```

### Cancel Task

```clarity
(define-public (cancel-task (task-id uint))
  ;; Checks:
  ;; - Caller is the task creator
  ;; - Task status is STATUS-ASSIGNED or STATUS-IN-PROGRESS
  ;; Actions:
  ;; - Transfer escrowed funds back to creator (token-aware)
  ;; - Update task: status → STATUS-CANCELLED
  ;; - Clear assignee
  ;; - Print task-cancelled event
)
```

### Reassign Expired Task

```clarity
(define-public (reassign-task (task-id uint) (new-assignee principal))
  ;; Checks:
  ;; - Caller is the task creator
  ;; - Task status is STATUS-EXPIRED
  ;; - New assignee is registered and has applied
  ;; Actions:
  ;; - Update task: set new assignee, status → STATUS-ASSIGNED
  ;; - Print task-reassigned event
)
```

### Withdraw Platform Fees (Admin Only)

```clarity
(define-public (withdraw-fees (token-type uint))
  ;; Checks:
  ;; - Caller is CONTRACT-DEPLOYER
  ;; - Withdrawable fees > 0 for the specified token
  ;; Actions:
  ;; - Transfer withdrawable fees to deployer (token-aware)
  ;; - Reset withdrawable fee counter for that token
  ;; - Print fees-withdrawn event
)
```

### Distribute Leaderboard Rewards (Admin Only)

```clarity
(define-public (distribute-leaderboard-rewards
    (token-type uint)
    (recipients (list 10 { address: principal, amount: uint }))
  )
  ;; Checks:
  ;; - Caller is CONTRACT-DEPLOYER
  ;; - Total of all amounts <= leaderboard pool for that token
  ;; - All recipients are registered users
  ;; Actions:
  ;; - Transfer specified amount to each recipient (token-aware)
  ;; - Deduct total from leaderboard pool
  ;; - Print leaderboard-distributed event with recipient details
  ;;
  ;; NOTE: The recipient list and amounts are calculated off-chain
  ;; from the composite scoring algorithm. The contract only validates
  ;; that the total doesn't exceed the pool and executes the transfers.
)
```

---

## Read-Only Functions

```clarity
;; Get task by ID
(define-read-only (get-task (task-id uint))
  (map-get? tasks { task-id: task-id })
)

;; Get user profile
(define-read-only (get-user (address principal))
  (map-get? users { address: address })
)

;; Get user by username
(define-read-only (get-user-by-username (username (string-ascii 50)))
  (map-get? usernames { username: username })
)

;; Check if user has applied for a task
(define-read-only (has-applied (task-id uint) (applicant principal))
  (is-some (map-get? task-applicants { task-id: task-id, applicant: applicant }))
)

;; Get applicant count for a task
(define-read-only (get-applicant-count (task-id uint))
  (default-to u0 (get count (map-get? task-applicant-count { task-id: task-id })))
)

;; Get current task counter
(define-read-only (get-task-counter)
  (var-get task-counter)
)

;; Get fee pools
(define-read-only (get-fee-info)
  {
    total-stx-fees: (var-get total-stx-fees),
    total-usdcx-fees: (var-get total-usdcx-fees),
    withdrawable-stx-fees: (var-get withdrawable-stx-fees),
    withdrawable-usdcx-fees: (var-get withdrawable-usdcx-fees),
    leaderboard-stx-pool: (var-get leaderboard-stx-pool),
    leaderboard-usdcx-pool: (var-get leaderboard-usdcx-pool)
  }
)

;; Check if task is expired (helper)
(define-read-only (is-task-expired (task-id uint))
  (let ((task (unwrap! (map-get? tasks { task-id: task-id }) false)))
    (and
      (> block-height (get deadline task))
      (< (get status task) STATUS-COMPLETED)
    )
  )
)
```

---

## Events (Print Statements for Indexing)

All state-changing functions emit print events that can be captured by Chainhooks or the Hiro API for off-chain indexing:

```clarity
;; Task lifecycle events
(print { event: "task-created", task-id: id, creator: tx-sender, token-type: token-type, funding: funding-amount, tip-percent: tip-percent })
(print { event: "task-application", task-id: id, applicant: tx-sender })
(print { event: "task-assigned", task-id: id, assignee: assignee })
(print { event: "task-started", task-id: id, assignee: tx-sender })
(print { event: "task-completed", task-id: id, assignee: tx-sender })
(print { event: "funds-released", task-id: id, assignee: assignee, amount: amount, token-type: token-type })
(print { event: "task-expired", task-id: id })
(print { event: "funds-reclaimed", task-id: id, creator: tx-sender, amount: amount })
(print { event: "task-cancelled", task-id: id, creator: tx-sender })
(print { event: "task-reassigned", task-id: id, new-assignee: new-assignee })

;; Fee events
(print { event: "fees-withdrawn", token-type: token-type, amount: amount, recipient: tx-sender })
(print { event: "leaderboard-distributed", token-type: token-type, total: total, recipients: recipients })

;; User events
(print { event: "user-registered", address: tx-sender, username: username })
```

---

## Important Clarity Notes

### Block Height vs Unix Timestamps
Clarity does not have access to wall-clock time. Use `block-height` for deadlines instead of unix timestamps. On Stacks, blocks are produced roughly every ~10 minutes (anchored to Bitcoin blocks). The frontend should convert user-friendly dates to approximate block heights.

### Token Transfers
- **STX:** Use built-in `stx-transfer?`
- **USDCx (SIP-010):** Use `contract-call?` to the USDCx contract's `transfer` function
- **From contract (escrow release):** Wrap in `(as-contract ...)` so the contract is the sender

### Post-Conditions
When building transactions on the frontend, always attach post-conditions to protect users:
- For STX: Use `Pc.principal(sender).willSendEq(amount).ustx()`
- For USDCx: Use `Pc.principal(sender).willSendEq(amount).ft(usdcxAsset)`

### Map Limitations
Clarity maps don't support iteration. You cannot loop through all tasks on-chain. Task listing and filtering must happen off-chain using indexed data from Chainhooks or the Hiro API.

### List Size Limits
The `distribute-leaderboard-rewards` function uses a list of max 10 recipients. Clarity requires fixed-size list types. If the top-N changes, the contract must be redeployed or a new version deployed.

---

## Testing with Clarinet

```bash
# Initialize project
clarinet new taskify
cd taskify

# Create contract
clarinet contract new taskify

# Run tests
clarinet test

# Open console for interactive testing
clarinet console

# Deploy to testnet
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

### Sample Clarinet Test Structure

```typescript
// tests/taskify.test.ts
import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

describe("taskify", () => {
  it("should register a new user", () => {
    const result = simnet.callPublicFn(
      "taskify",
      "register-user",
      [Cl.stringAscii("godbrand")],
      wallet1
    );
    expect(result.result).toBeOk(Cl.bool(true));
  });

  it("should create a task with STX funding", () => {
    // Register first
    simnet.callPublicFn("taskify", "register-user", [Cl.stringAscii("creator1")], wallet1);

    const result = simnet.callPublicFn(
      "taskify",
      "create-task",
      [
        Cl.stringAscii("Build a DeFi dashboard"),
        Cl.stringUtf8("Create a dashboard for tracking DeFi positions on Stacks"),
        Cl.none(),                     // no github link
        Cl.uint(1000000),              // 1 STX in microSTX
        Cl.uint(100),                  // deadline at block 100
        Cl.uint(0),                    // TOKEN-STX
        Cl.uint(2),                    // 2% tip
      ],
      wallet1
    );
    expect(result.result).toBeOk(Cl.uint(0)); // first task ID = 0
  });

  it("should create a task with USDCx funding", () => {
    // Similar to above but with token-type = u1 (TOKEN-USDCX)
    // Requires USDCx mock contract in test environment
  });

  it("should apply for a task", () => {
    // wallet2 applies for task created by wallet1
  });

  it("should assign, start, complete, approve, and release funds", () => {
    // Full lifecycle test
  });

  it("should handle expiration and reclaim", () => {
    // Advance block height past deadline, then reclaim
    simnet.mineEmptyBlocks(200);
    // ...
  });
});
```
