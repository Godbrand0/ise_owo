;; title: taskify
;; version: 1.0.0
;; summary: A decentralized bounty board on Stacks.
;; description: Enables creators to fund tasks with STX or USDCx, assign contributors, and release funds on approval.

;; traits
(use-trait ft-trait .sip-010-trait-ft-standard.sip-010-trait)

;; constants
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

;; Contract deployer
(define-constant CONTRACT-DEPLOYER tx-sender)

;; data vars
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

;; data maps
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

;; public functions

;; User Registration
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

;; Create Task (STX or USDCx)
(define-public (create-task
    (title (string-ascii 100))
    (description (string-utf8 500))
    (github-link (optional (string-ascii 200)))
    (funding-amount uint)
    (deadline uint)
    (token-type uint)
    (tip-percent uint)
  )
  (let
    (
      (id (var-get task-counter))
      (creator-profile (unwrap! (get-user tx-sender) ERR-NOT-REGISTERED))
      (base-fee (/ (* funding-amount BASE-FEE-PERCENT) FEE-DENOMINATOR))
      (tip-amount (/ (* funding-amount tip-percent) FEE-DENOMINATOR))
      (total-fee (if (> tip-percent u0) (+ base-fee tip-amount) base-fee)) ;; fix for possible 0 tip
      (escrow-amount (- funding-amount total-fee))
      (platform-fee (/ (* total-fee u80) u100)) ;; 80% to platform
      (reward-fee (- total-fee platform-fee))   ;; 20% to leaderboard
    )
    (asserts! (> funding-amount u0) ERR-ZERO-AMOUNT)
    (asserts! (> deadline block-height) ERR-DEADLINE-PASSED)
    (asserts! (<= tip-percent MAX-TIP-PERCENT) ERR-INVALID-TIP)
    (asserts! (or (is-eq token-type TOKEN-STX) (is-eq token-type TOKEN-USDCX)) ERR-INVALID-TOKEN)

    ;; Transfer funds
    (if (is-eq token-type TOKEN-STX)
      (try! (stx-transfer? funding-amount tx-sender (as-contract tx-sender)))
      true ;; Placeholder for USDCx
    )

    ;; Update fees
    (if (is-eq token-type TOKEN-STX)
      (begin
        (var-set total-stx-fees (+ (var-get total-stx-fees) total-fee))
        (var-set withdrawable-stx-fees (+ (var-get withdrawable-stx-fees) platform-fee))
        (var-set leaderboard-stx-pool (+ (var-get leaderboard-stx-pool) reward-fee))
      )
      (begin
        (var-set total-usdcx-fees (+ (var-get total-usdcx-fees) total-fee))
        (var-set withdrawable-usdcx-fees (+ (var-get withdrawable-usdcx-fees) platform-fee))
        (var-set leaderboard-usdcx-pool (+ (var-get leaderboard-usdcx-pool) reward-fee))
      )
    )

    ;; Save task
    (map-set tasks { task-id: id }
      {
        title: title,
        description: description,
        github-link: github-link,
        funding-amount: escrow-amount,
        total-funded: funding-amount,
        token-type: token-type,
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
    (print { event: "task-created", task-id: id, creator: tx-sender, token-type: token-type, funding: funding-amount })
    (ok id)
  )
)

;; Apply for Task
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

;; Assign Task (Creator Only)
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

;; Start Task (Assignee Only)
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

;; Complete Task (Assignee Only)
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

;; Approve and Release Funds (Creator Only)
(define-public (approve-and-release (task-id uint))
  (let
    (
      (task (unwrap! (get-task task-id) ERR-TASK-NOT-FOUND))
      (assignee (unwrap! (get assignee task) ERR-INVALID-STATE))
      (amount (get funding-amount task))
      (token-type (get-token-type task-id))
      (assignee-profile (unwrap! (get-user assignee) ERR-NOT-REGISTERED))
    )
    (asserts! (is-eq (get creator task) tx-sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status task) STATUS-COMPLETED) ERR-INVALID-STATE)

    ;; Transfer escrowed funds to assignee
    (if (is-eq token-type TOKEN-STX)
      (try! (as-contract (stx-transfer? amount tx-sender assignee)))
      true ;; USDCx handled externally
    )

    ;; Update task status
    (map-set tasks { task-id: task-id } (merge task { status: STATUS-FUNDS-RELEASED }))

    ;; Update assignee stats
    (map-set users { address: assignee }
      (merge assignee-profile { 
        tasks-completed: (+ (get tasks-completed assignee-profile) u1),
        total-earned: (+ (get total-earned assignee-profile) amount)
      })
    )

    (print { event: "funds-released", task-id: task-id, assignee: assignee, amount: amount })
    (ok true)
  )
)

;; Withdraw Platform Fees (Admin Only)
(define-public (withdraw-fees (token-type uint))
  (let
    (
      (amount (if (is-eq token-type TOKEN-STX) (var-get withdrawable-stx-fees) (var-get withdrawable-usdcx-fees)))
    )
    (asserts! (is-eq tx-sender CONTRACT-DEPLOYER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)

    (if (is-eq token-type TOKEN-STX)
      (begin
        (try! (as-contract (stx-transfer? amount tx-sender CONTRACT-DEPLOYER)))
        (var-set withdrawable-stx-fees u0)
      )
      (var-set withdrawable-usdcx-fees u0)
    )
    (print { event: "fees-withdrawn", token-type: token-type, amount: amount })
    (ok amount)
  )
)

;; Distribute Leaderboard Rewards (Admin Only)
(define-public (distribute-rewards
    (token-type uint)
    (recipients (list 10 { address: principal, amount: uint }))
  )
  (let
    (
      (pool (if (is-eq token-type TOKEN-STX) (var-get leaderboard-stx-pool) (var-get leaderboard-usdcx-pool)))
    )
    (asserts! (is-eq tx-sender CONTRACT-DEPLOYER) ERR-NOT-AUTHORIZED)
    
    (if (is-eq token-type TOKEN-STX)
      (var-set leaderboard-stx-pool u0)
      (var-set leaderboard-usdcx-pool u0)
    )
    (print { event: "leaderboard-distributed", token-type: token-type })
    (ok true)
  )
)

;; read only functions

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

(define-read-only (get-token-type (task-id uint))
  (default-to TOKEN-STX (get token-type (map-get? tasks { task-id: task-id })))
)

(define-read-only (get-fee-info)
  {
    stx-fees: (var-get withdrawable-stx-fees),
    usdcx-fees: (var-get withdrawable-usdcx-fees),
    stx-pool: (var-get leaderboard-stx-pool),
    usdcx-pool: (var-get leaderboard-usdcx-pool)
  }
)
