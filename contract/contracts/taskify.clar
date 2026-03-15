;; title: taskify
;; version: 1.1.0
;; summary: A decentralized bounty board on Stacks.
;; description: Enables creators to fund tasks with STX or USDCx, assign contributors, and release funds on approval.

;; traits
;; NOTE: For testnet use .sip-010-trait-ft-standard.sip-010-trait
;; For mainnet use 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard.sip-010-trait
(use-trait ft-trait .sip-010-trait-ft-standard.sip-010-trait)

;; ============================================================
;; CONSTANTS
;; ============================================================

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
(define-constant MIN-FUNDING-AMOUNT u100) ;; minimum to ensure fee > 0

;; USDCx contract reference for validation
;; NOTE: Update to mainnet address for production deployment
;; Mainnet: SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx
;; Testnet: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx
(define-constant USDCX-CONTRACT .usdcx)

;; Contract deployer (platform admin)
(define-constant CONTRACT-DEPLOYER tx-sender)

;; ============================================================
;; DATA VARIABLES
;; ============================================================

(define-data-var task-counter uint u0)

;; Total accumulated fees (tracked per token type)
(define-data-var total-stx-fees uint u0)
(define-data-var total-usdcx-fees uint u0)

;; Fees available for withdrawal (80% of total fees)
(define-data-var withdrawable-stx-fees uint u0)
(define-data-var withdrawable-usdcx-fees uint u0)

;; Leaderboard pool (20% of fees)
(define-data-var leaderboard-stx-pool uint u0)
(define-data-var leaderboard-usdcx-pool uint u0)

;; ============================================================
;; DATA MAPS
;; ============================================================

(define-map tasks
  { task-id: uint }
  {
    title: (string-ascii 100),
    description: (string-utf8 500),
    github-link: (optional (string-ascii 200)),
    funding-amount: uint,
    total-funded: uint,
    token-type: uint,
    deadline: uint,
    creator: principal,
    assignee: (optional principal),
    status: uint,
    created-at: uint,
    completed-at: (optional uint),
    base-fee: uint,
    tip-amount: uint,
    tip-percent: uint
  }
)

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

(define-map usernames
  { username: (string-ascii 50) }
  { address: principal }
)

(define-map task-applicants
  { task-id: uint, applicant: principal }
  { applied-at: uint }
)

(define-map task-applicant-count
  { task-id: uint }
  { count: uint }
)

;; ============================================================
;; PRIVATE HELPERS
;; ============================================================

;; Fold helper: sum amounts in a recipient list
(define-private (sum-amounts (item { address: principal, amount: uint }) (total uint))
  (+ total (get amount item))
)

;; Fold helper: transfer STX reward to each recipient (short-circuits on failure)
(define-private (transfer-stx-reward (recipient { address: principal, amount: uint }) (prev-ok bool))
  (if prev-ok
    (is-ok (as-contract (stx-transfer? (get amount recipient) tx-sender (get address recipient))))
    false
  )
)

;; Validate that a passed ft-trait is the approved USDCx contract
(define-private (is-valid-usdcx (ft-token <ft-trait>))
  (is-eq (contract-of ft-token) USDCX-CONTRACT)
)

;; ============================================================
;; PUBLIC FUNCTIONS
;; ============================================================

;; -----------------------------------------------------------
;; User Registration
;; -----------------------------------------------------------
(define-public (register-user (username (string-ascii 50)))
  (let
    (
      (user-exists (is-some (get-user tx-sender)))
      (username-exists (is-some (get-user-by-username username)))
    )
    (asserts! (not user-exists) ERR-ALREADY-REGISTERED)
    (asserts! (not username-exists) ERR-USERNAME-TAKEN)
    (asserts! (> (len username) u0) ERR-ZERO-AMOUNT)
    (map-set users { address: tx-sender }
      {
        username: username,
        registered-at: block-height,
        tasks-created: u0,
        tasks-completed: u0,
        total-funded: u0,
        total-earned: u0
      }
    )
    (map-set usernames { username: username } { address: tx-sender })
    (print { event: "user-registered", address: tx-sender, username: username })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Create Task (STX funding)
;; -----------------------------------------------------------
(define-public (create-task-stx
    (title (string-ascii 100))
    (description (string-utf8 500))
    (github-link (optional (string-ascii 200)))
    (funding-amount uint)
    (deadline uint)
    (tip-percent uint)
  )
  (let
    (
      (id (var-get task-counter))
      (creator-profile (unwrap! (get-user tx-sender) ERR-NOT-REGISTERED))
      (base-fee (/ (* funding-amount BASE-FEE-PERCENT) FEE-DENOMINATOR))
      (tip-amount (/ (* funding-amount tip-percent) FEE-DENOMINATOR))
      (total-fee (+ base-fee tip-amount))
      (escrow-amount (- funding-amount total-fee))
      (platform-fee (/ (* total-fee u80) u100))
      (reward-fee (- total-fee platform-fee))
    )
    ;; Validations
    (asserts! (>= funding-amount MIN-FUNDING-AMOUNT) ERR-ZERO-AMOUNT)
    (asserts! (> deadline block-height) ERR-DEADLINE-PASSED)
    (asserts! (<= tip-percent MAX-TIP-PERCENT) ERR-INVALID-TIP)

    ;; Transfer STX from creator to contract
    (try! (stx-transfer? funding-amount tx-sender (as-contract tx-sender)))

    ;; Update fee pools
    (var-set total-stx-fees (+ (var-get total-stx-fees) total-fee))
    (var-set withdrawable-stx-fees (+ (var-get withdrawable-stx-fees) platform-fee))
    (var-set leaderboard-stx-pool (+ (var-get leaderboard-stx-pool) reward-fee))

    ;; Save task
    (map-set tasks { task-id: id }
      {
        title: title,
        description: description,
        github-link: github-link,
        funding-amount: escrow-amount,
        total-funded: funding-amount,
        token-type: TOKEN-STX,
        deadline: deadline,
        creator: tx-sender,
        assignee: none,
        status: STATUS-CREATED,
        created-at: block-height,
        completed-at: none,
        base-fee: base-fee,
        tip-amount: tip-amount,
        tip-percent: tip-percent
      }
    )

    ;; Update creator stats
    (map-set users { address: tx-sender }
      (merge creator-profile {
        tasks-created: (+ (get tasks-created creator-profile) u1),
        total-funded: (+ (get total-funded creator-profile) funding-amount)
      })
    )

    (var-set task-counter (+ id u1))
    (print { event: "task-created", task-id: id, creator: tx-sender, token-type: TOKEN-STX, funding: funding-amount, tip-percent: tip-percent })
    (ok id)
  )
)

;; -----------------------------------------------------------
;; Create Task (USDCx funding)
;; -----------------------------------------------------------
(define-public (create-task-usdcx
    (title (string-ascii 100))
    (description (string-utf8 500))
    (github-link (optional (string-ascii 200)))
    (funding-amount uint)
    (deadline uint)
    (tip-percent uint)
    (ft-token <ft-trait>)
  )
  (let
    (
      (id (var-get task-counter))
      (creator-profile (unwrap! (get-user tx-sender) ERR-NOT-REGISTERED))
      (base-fee (/ (* funding-amount BASE-FEE-PERCENT) FEE-DENOMINATOR))
      (tip-amount (/ (* funding-amount tip-percent) FEE-DENOMINATOR))
      (total-fee (+ base-fee tip-amount))
      (escrow-amount (- funding-amount total-fee))
      (platform-fee (/ (* total-fee u80) u100))
      (reward-fee (- total-fee platform-fee))
    )
    ;; Validations
    (asserts! (>= funding-amount MIN-FUNDING-AMOUNT) ERR-ZERO-AMOUNT)
    (asserts! (> deadline block-height) ERR-DEADLINE-PASSED)
    (asserts! (<= tip-percent MAX-TIP-PERCENT) ERR-INVALID-TIP)
    (asserts! (is-valid-usdcx ft-token) ERR-INVALID-TOKEN)

    ;; Transfer USDCx from creator to contract
    (try! (contract-call? ft-token transfer funding-amount tx-sender (as-contract tx-sender) none))

    ;; Update fee pools
    (var-set total-usdcx-fees (+ (var-get total-usdcx-fees) total-fee))
    (var-set withdrawable-usdcx-fees (+ (var-get withdrawable-usdcx-fees) platform-fee))
    (var-set leaderboard-usdcx-pool (+ (var-get leaderboard-usdcx-pool) reward-fee))

    ;; Save task
    (map-set tasks { task-id: id }
      {
        title: title,
        description: description,
        github-link: github-link,
        funding-amount: escrow-amount,
        total-funded: funding-amount,
        token-type: TOKEN-USDCX,
        deadline: deadline,
        creator: tx-sender,
        assignee: none,
        status: STATUS-CREATED,
        created-at: block-height,
        completed-at: none,
        base-fee: base-fee,
        tip-amount: tip-amount,
        tip-percent: tip-percent
      }
    )

    ;; Update creator stats
    (map-set users { address: tx-sender }
      (merge creator-profile {
        tasks-created: (+ (get tasks-created creator-profile) u1),
        total-funded: (+ (get total-funded creator-profile) funding-amount)
      })
    )

    (var-set task-counter (+ id u1))
    (print { event: "task-created", task-id: id, creator: tx-sender, token-type: TOKEN-USDCX, funding: funding-amount, tip-percent: tip-percent })
    (ok id)
  )
)

;; -----------------------------------------------------------
;; Apply for Task
;; -----------------------------------------------------------
(define-public (apply-for-task (task-id uint))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
      (current-count (get count (default-to { count: u0 } (map-get? task-applicant-count { task-id: task-id }))))
    )
    (asserts! (is-some (get-user tx-sender)) ERR-NOT-REGISTERED)
    (asserts! (not (is-eq (get creator task) tx-sender)) ERR-SELF-ASSIGN)
    (asserts! (is-eq (get status task) STATUS-CREATED) ERR-INVALID-STATE)
    (asserts! (not (has-applied task-id tx-sender)) ERR-ALREADY-APPLIED)
    (asserts! (<= block-height (get deadline task)) ERR-DEADLINE-PASSED)

    (map-set task-applicants { task-id: task-id, applicant: tx-sender } { applied-at: block-height })
    (map-set task-applicant-count { task-id: task-id } { count: (+ current-count u1) })
    (print { event: "task-application", task-id: task-id, applicant: tx-sender })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Assign Task (Creator Only)
;; -----------------------------------------------------------
(define-public (assign-task (task-id uint) (assignee principal))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
    )
    (asserts! (is-eq (get creator task) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status task) STATUS-CREATED) ERR-INVALID-STATE)
    (asserts! (has-applied task-id assignee) ERR-NOT-APPLICANT)

    (map-set tasks { task-id: task-id } (merge task { status: STATUS-ASSIGNED, assignee: (some assignee) }))
    (print { event: "task-assigned", task-id: task-id, assignee: assignee })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Start Task (Assignee Only)
;; -----------------------------------------------------------
(define-public (start-task (task-id uint))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
    )
    (asserts! (is-eq (get assignee task) (some tx-sender)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status task) STATUS-ASSIGNED) ERR-INVALID-STATE)

    (map-set tasks { task-id: task-id } (merge task { status: STATUS-IN-PROGRESS }))
    (print { event: "task-started", task-id: task-id, assignee: tx-sender })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Complete Task (Assignee Only)
;; -----------------------------------------------------------
(define-public (complete-task (task-id uint))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
    )
    (asserts! (is-eq (get assignee task) (some tx-sender)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status task) STATUS-IN-PROGRESS) ERR-INVALID-STATE)

    (map-set tasks { task-id: task-id } (merge task { status: STATUS-COMPLETED, completed-at: (some block-height) }))
    (print { event: "task-completed", task-id: task-id, assignee: tx-sender })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Approve and Release Funds - STX (Creator Only)
;; -----------------------------------------------------------
(define-public (approve-and-release-stx (task-id uint))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
      (assignee (unwrap! (get assignee task) ERR-INVALID-STATE))
      (amount (get funding-amount task))
      (token-type (get token-type task))
      (assignee-profile (unwrap! (get-user assignee) ERR-NOT-REGISTERED))
    )
    (asserts! (is-eq (get creator task) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status task) STATUS-COMPLETED) ERR-INVALID-STATE)
    (asserts! (is-eq token-type TOKEN-STX) ERR-INVALID-TOKEN)

    ;; Transfer escrowed STX to assignee
    (try! (as-contract (stx-transfer? amount tx-sender assignee)))

    ;; Update task status
    (map-set tasks { task-id: task-id } (merge task { status: STATUS-FUNDS-RELEASED }))

    ;; Update assignee stats
    (map-set users { address: assignee }
      (merge assignee-profile {
        tasks-completed: (+ (get tasks-completed assignee-profile) u1),
        total-earned: (+ (get total-earned assignee-profile) amount)
      })
    )

    (print { event: "funds-released", task-id: task-id, assignee: assignee, amount: amount, token-type: TOKEN-STX })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Approve and Release Funds - USDCx (Creator Only)
;; -----------------------------------------------------------
(define-public (approve-and-release-usdcx (task-id uint) (ft-token <ft-trait>))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
      (assignee (unwrap! (get assignee task) ERR-INVALID-STATE))
      (amount (get funding-amount task))
      (token-type (get token-type task))
      (assignee-profile (unwrap! (get-user assignee) ERR-NOT-REGISTERED))
    )
    (asserts! (is-eq (get creator task) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status task) STATUS-COMPLETED) ERR-INVALID-STATE)
    (asserts! (is-eq token-type TOKEN-USDCX) ERR-INVALID-TOKEN)
    (asserts! (is-valid-usdcx ft-token) ERR-INVALID-TOKEN)

    ;; Transfer escrowed USDCx to assignee
    (try! (as-contract (contract-call? ft-token transfer amount tx-sender assignee none)))

    ;; Update task status
    (map-set tasks { task-id: task-id } (merge task { status: STATUS-FUNDS-RELEASED }))

    ;; Update assignee stats
    (map-set users { address: assignee }
      (merge assignee-profile {
        tasks-completed: (+ (get tasks-completed assignee-profile) u1),
        total-earned: (+ (get total-earned assignee-profile) amount)
      })
    )

    (print { event: "funds-released", task-id: task-id, assignee: assignee, amount: amount, token-type: TOKEN-USDCX })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Cancel Task (Creator Only - from Created, Assigned, or InProgress)
;; -----------------------------------------------------------
(define-public (cancel-task-stx (task-id uint))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
      (amount (get funding-amount task))
      (status (get status task))
    )
    (asserts! (is-eq (get creator task) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get token-type task) TOKEN-STX) ERR-INVALID-TOKEN)
    (asserts! (or (is-eq status STATUS-CREATED)
                  (is-eq status STATUS-ASSIGNED)
                  (is-eq status STATUS-IN-PROGRESS)) ERR-INVALID-STATE)

    ;; Refund STX to creator
    (try! (as-contract (stx-transfer? amount tx-sender (get creator task))))

    (map-set tasks { task-id: task-id } (merge task { status: STATUS-CANCELLED, assignee: none }))
    (print { event: "task-cancelled", task-id: task-id, creator: tx-sender })
    (ok true)
  )
)

(define-public (cancel-task-usdcx (task-id uint) (ft-token <ft-trait>))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
      (amount (get funding-amount task))
      (status (get status task))
    )
    (asserts! (is-eq (get creator task) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get token-type task) TOKEN-USDCX) ERR-INVALID-TOKEN)
    (asserts! (is-valid-usdcx ft-token) ERR-INVALID-TOKEN)
    (asserts! (or (is-eq status STATUS-CREATED)
                  (is-eq status STATUS-ASSIGNED)
                  (is-eq status STATUS-IN-PROGRESS)) ERR-INVALID-STATE)

    ;; Refund USDCx to creator
    (try! (as-contract (contract-call? ft-token transfer amount tx-sender (get creator task) none)))

    (map-set tasks { task-id: task-id } (merge task { status: STATUS-CANCELLED, assignee: none }))
    (print { event: "task-cancelled", task-id: task-id, creator: tx-sender })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Mark Task Expired (Anyone can call once deadline passes)
;; -----------------------------------------------------------
(define-public (mark-expired (task-id uint))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
    )
    (asserts! (> block-height (get deadline task)) ERR-DEADLINE-NOT-PASSED)
    (asserts! (< (get status task) STATUS-COMPLETED) ERR-INVALID-STATE)

    (map-set tasks { task-id: task-id } (merge task { status: STATUS-EXPIRED }))
    (print { event: "task-expired", task-id: task-id })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Reclaim Expired Funds - STX (Creator Only)
;; -----------------------------------------------------------
(define-public (reclaim-funds-stx (task-id uint))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
      (amount (get funding-amount task))
    )
    (asserts! (is-eq (get creator task) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status task) STATUS-EXPIRED) ERR-INVALID-STATE)
    (asserts! (is-eq (get token-type task) TOKEN-STX) ERR-INVALID-TOKEN)

    (try! (as-contract (stx-transfer? amount tx-sender (get creator task))))

    (map-set tasks { task-id: task-id } (merge task { status: STATUS-CANCELLED }))
    (print { event: "funds-reclaimed", task-id: task-id, creator: tx-sender, amount: amount, token-type: TOKEN-STX })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Reclaim Expired Funds - USDCx (Creator Only)
;; -----------------------------------------------------------
(define-public (reclaim-funds-usdcx (task-id uint) (ft-token <ft-trait>))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
      (amount (get funding-amount task))
    )
    (asserts! (is-eq (get creator task) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status task) STATUS-EXPIRED) ERR-INVALID-STATE)
    (asserts! (is-eq (get token-type task) TOKEN-USDCX) ERR-INVALID-TOKEN)
    (asserts! (is-valid-usdcx ft-token) ERR-INVALID-TOKEN)

    (try! (as-contract (contract-call? ft-token transfer amount tx-sender (get creator task) none)))

    (map-set tasks { task-id: task-id } (merge task { status: STATUS-CANCELLED }))
    (print { event: "funds-reclaimed", task-id: task-id, creator: tx-sender, amount: amount, token-type: TOKEN-USDCX })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Reassign Expired Task (Creator Only) - with new deadline
;; -----------------------------------------------------------
(define-public (reassign-task (task-id uint) (new-assignee principal) (new-deadline uint))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
    )
    (asserts! (is-eq (get creator task) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status task) STATUS-EXPIRED) ERR-INVALID-STATE)
    (asserts! (> new-deadline block-height) ERR-DEADLINE-PASSED)
    (asserts! (has-applied task-id new-assignee) ERR-NOT-APPLICANT)
    (asserts! (is-some (get-user new-assignee)) ERR-NOT-REGISTERED)

    (map-set tasks { task-id: task-id }
      (merge task {
        status: STATUS-ASSIGNED,
        assignee: (some new-assignee),
        deadline: new-deadline
      })
    )
    (print { event: "task-reassigned", task-id: task-id, new-assignee: new-assignee, new-deadline: new-deadline })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Withdraw Platform Fees - STX (Admin Only)
;; -----------------------------------------------------------
(define-public (withdraw-fees-stx)
  (let
    (
      (amount (var-get withdrawable-stx-fees))
    )
    (asserts! (is-eq tx-sender CONTRACT-DEPLOYER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)

    (try! (as-contract (stx-transfer? amount tx-sender CONTRACT-DEPLOYER)))
    (var-set withdrawable-stx-fees u0)

    (print { event: "fees-withdrawn", token-type: TOKEN-STX, amount: amount })
    (ok amount)
  )
)

;; -----------------------------------------------------------
;; Withdraw Platform Fees - USDCx (Admin Only)
;; -----------------------------------------------------------
(define-public (withdraw-fees-usdcx (ft-token <ft-trait>))
  (let
    (
      (amount (var-get withdrawable-usdcx-fees))
    )
    (asserts! (is-eq tx-sender CONTRACT-DEPLOYER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (asserts! (is-valid-usdcx ft-token) ERR-INVALID-TOKEN)

    (try! (as-contract (contract-call? ft-token transfer amount tx-sender CONTRACT-DEPLOYER none)))
    (var-set withdrawable-usdcx-fees u0)

    (print { event: "fees-withdrawn", token-type: TOKEN-USDCX, amount: amount })
    (ok amount)
  )
)

;; -----------------------------------------------------------
;; Distribute Leaderboard Rewards - STX (Admin Only)
;; -----------------------------------------------------------
(define-public (distribute-rewards-stx
    (recipients (list 10 { address: principal, amount: uint }))
  )
  (let
    (
      (pool (var-get leaderboard-stx-pool))
      (total (fold sum-amounts recipients u0))
    )
    (asserts! (is-eq tx-sender CONTRACT-DEPLOYER) ERR-NOT-AUTHORIZED)
    (asserts! (> (len recipients) u0) ERR-ZERO-AMOUNT)
    (asserts! (<= total pool) ERR-INSUFFICIENT-FUNDS)

    (var-set leaderboard-stx-pool (- pool total))
    (asserts! (fold transfer-stx-reward recipients true) ERR-TRANSFER-FAILED)

    (print { event: "leaderboard-distributed", token-type: TOKEN-STX, total: total, recipient-count: (len recipients) })
    (ok true)
  )
)

;; -----------------------------------------------------------
;; Distribute Leaderboard Rewards - USDCx (Admin Only)
;; NOTE: Due to Clarity limitations with fold and trait params,
;; USDCx rewards are distributed one at a time via this function.
;; Call it once per recipient from the off-chain admin script.
;; -----------------------------------------------------------
(define-public (distribute-reward-usdcx
    (recipient principal)
    (amount uint)
    (ft-token <ft-trait>)
  )
  (let
    (
      (pool (var-get leaderboard-usdcx-pool))
    )
    (asserts! (is-eq tx-sender CONTRACT-DEPLOYER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (asserts! (<= amount pool) ERR-INSUFFICIENT-FUNDS)
    (asserts! (is-valid-usdcx ft-token) ERR-INVALID-TOKEN)

    (try! (as-contract (contract-call? ft-token transfer amount tx-sender recipient none)))
    (var-set leaderboard-usdcx-pool (- pool amount))

    (print { event: "leaderboard-reward-usdcx", recipient: recipient, amount: amount })
    (ok true)
  )
)

;; ============================================================
;; READ-ONLY FUNCTIONS
;; ============================================================

(define-read-only (get-task (id uint))
  (map-get? tasks { task-id: id })
)

(define-read-only (get-user (address principal))
  (map-get? users { address: address })
)

(define-read-only (get-user-by-username (name (string-ascii 50)))
  (map-get? usernames { username: name })
)

(define-read-only (has-applied (task-id uint) (user principal))
  (is-some (map-get? task-applicants { task-id: task-id, applicant: user }))
)

(define-read-only (get-applicant-count (task-id uint))
  (default-to u0 (get count (map-get? task-applicant-count { task-id: task-id })))
)

(define-read-only (get-task-counter)
  (var-get task-counter)
)

(define-read-only (is-task-expired (task-id uint))
  (match (map-get? tasks { task-id: task-id })
    task (and
      (> block-height (get deadline task))
      (< (get status task) STATUS-COMPLETED)
    )
    false
  )
)

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
