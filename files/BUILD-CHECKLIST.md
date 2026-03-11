# Taskify on Stacks — Build Checklist

## Quick Reference

| Doc | What It Covers |
|---|---|
| `ARCHITECTURE.md` | System overview, data flow, tech stack, fee model, token addresses |
| `SMART-CONTRACT.md` | Full Clarity contract spec — data maps, functions, events, tests |
| `FRONTEND-INTEGRATION.md` | Stacks.js, wallet, service layer, UI changes, env vars |
| `AI-INTEGRATION.md` | Scoring engine, insight prompts, API integration, caching |

---

## Phase 1: Smart Contract (Clarity)

- [ ] Initialize Clarinet project (`clarinet new taskify`)
- [ ] Define constants (errors, statuses, token types, fee config)
- [ ] Define data variables (counters, fee pools)
- [ ] Define data maps (tasks, users, usernames, applicants)
- [ ] Implement `register-user`
- [ ] Implement `create-task` with dual-token support (STX + USDCx)
- [ ] Implement fee calculation (2% base + optional tip)
- [ ] Implement fee splitting (80% platform / 20% leaderboard pool)
- [ ] Implement `apply-for-task`
- [ ] Implement `assign-task`
- [ ] Implement `start-task`
- [ ] Implement `complete-task`
- [ ] Implement `approve-and-release` with token-aware transfer
- [ ] Implement `mark-expired`
- [ ] Implement `reclaim-funds`
- [ ] Implement `cancel-task`
- [ ] Implement `reassign-task`
- [ ] Implement `withdraw-fees` (admin only)
- [ ] Implement `distribute-leaderboard-rewards` (admin only)
- [ ] Implement all read-only functions
- [ ] Add print events for all state changes
- [ ] Write Clarinet unit tests for every function
- [ ] Test full lifecycle: create → apply → assign → start → complete → release
- [ ] Test expiration flow
- [ ] Test cancellation flow
- [ ] Test USDCx funding path (mock SIP-010 token in tests)
- [ ] Test fee math edge cases (rounding, zero amounts)
- [ ] Deploy to Stacks testnet

## Phase 2: Frontend Migration

- [ ] Remove Stellar dependencies
- [ ] Install Stacks dependencies (@stacks/connect, @stacks/transactions, @stacks/network)
- [ ] Rewrite WalletProvider with Stacks Connect
- [ ] Rewrite contract service layer (taskify.ts)
- [ ] Implement post-conditions for STX transfers
- [ ] Implement post-conditions for USDCx (SIP-010) transfers
- [ ] Implement read-only call wrappers
- [ ] Add block-height ↔ date conversion utilities
- [ ] Update task creation form (token selector, tip selector, fee breakdown)
- [ ] Update task cards (token badge, tip display)
- [ ] Update task details page
- [ ] Update dashboard stats (split by token)
- [ ] Implement Hiro API integration for task listing
- [ ] Test wallet connection (Leather + Xverse)
- [ ] Test full task lifecycle through UI
- [ ] Test USDCx flow end-to-end
- [ ] Update environment variables

## Phase 3: Leaderboard & AI Insights

- [ ] Set up off-chain database (PostgreSQL/Supabase)
- [ ] Set up Chainhooks or Hiro API event indexer
- [ ] Build scoring engine (deterministic, weighted composite)
- [ ] Build monthly leaderboard calculation job
- [ ] Build admin payout trigger (calls `distribute-leaderboard-rewards`)
- [ ] Create leaderboard UI page
- [ ] Set up AI API integration (backend route, not frontend)
- [ ] Implement general insights prompt + generation
- [ ] Implement personal insights prompt + generation
- [ ] Build insight caching layer
- [ ] Add general insights to public dashboard
- [ ] Add personal insights to creator profile
- [ ] Test full monthly cycle (scoring → ranking → payout → insights)

## Phase 4: Polish & Grant Submission

- [ ] Public dashboard with TVL, transaction volume, unique addresses
- [ ] Monthly update mechanism (for grant milestone reporting)
- [ ] Security review of Clarity contract
- [ ] Gas optimization pass on contract
- [ ] Performance optimization on frontend
- [ ] Deploy to Stacks mainnet
- [ ] Write grant application
- [ ] Prepare demo / walkthrough video

---

## Key Contract Addresses (Testnet Development)

```
USDCx Testnet:  ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx
SIP-010 Trait:  SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard
Hiro Testnet:   https://api.testnet.hiro.so
Hiro Mainnet:   https://api.mainnet.hiro.so
```

## Key Contract Addresses (Mainnet Production)

```
USDCx Mainnet:  SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx
SIP-010 Trait:  SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard
```
