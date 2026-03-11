# Taskify on Stacks — Architecture Overview

## Project Summary

Taskify is a decentralized bounty board migrated from Stellar/Soroban to the Stacks blockchain (Bitcoin Layer 2). It enables creators to fund tasks, assign contributors, track progress, and release funds on-chain — all secured by Bitcoin via Proof of Transfer.

**Target Grant:** Stacks Endowment Expertise Grant ($10,000–$50,000 STX)

---

## What's New (Stacks Version vs Stellar Version)

| Feature | Stellar Version | Stacks Version |
|---|---|---|
| Smart contract language | Rust/WASM (Soroban) | Clarity |
| Native token | XLM (stroops) | STX (microSTX) |
| Stablecoin | None | USDCx (SIP-010) |
| Funding options | XLM only | STX + USDCx (dual-token) |
| Platform fee | Flat 3% | 2% base + optional 1-3% creator tip |
| Creator incentives | None | Monthly leaderboard with 20% fee redistribution |
| AI features | None | Leaderboard insights dashboard (general + personal) |
| Wallet support | Freighter/Albedo/XBull | Leather/Xverse via Stacks Connect |
| Frontend framework | React/Vite/TS/Tailwind v4 | Same (minimal changes) |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/Vite/TS)                  │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Dashboard    │  │ Task CRUD    │  │ Leaderboard + Insights  │ │
│  │ & Stats      │  │ & Lifecycle  │  │ (AI-powered)            │ │
│  └──────┬──────┘  └──────┬───────┘  └────────────┬────────────┘ │
│         │                │                        │              │
│  ┌──────┴────────────────┴────────────────────────┴────────────┐ │
│  │                  Service Layer                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │ │
│  │  │ taskify.ts   │  │ wallet.ts    │  │ insights.ts       │  │ │
│  │  │ (contract    │  │ (Stacks      │  │ (AI API calls)    │  │ │
│  │  │  calls)      │  │  Connect)    │  │                   │  │ │
│  │  └──────┬───────┘  └──────┬───────┘  └───────┬───────────┘  │ │
│  └─────────┼─────────────────┼──────────────────┼──────────────┘ │
└────────────┼─────────────────┼──────────────────┼────────────────┘
             │                 │                  │
             ▼                 ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐
│ Stacks          │  │ Leather/Xverse  │  │ AI API              │
│ Blockchain      │  │ Wallet          │  │ (Claude or Gemini)  │
│                 │  │                 │  │                     │
│ ┌─────────────┐ │  └─────────────────┘  └──────────┬──────────┘
│ │ taskify.clar│ │                                   │
│ │ (Clarity    │ │                        ┌──────────┴──────────┐
│ │  contract)  │ │                        │ Off-Chain Indexer   │
│ └─────────────┘ │                        │ (Chainhooks/Hiro    │
│                 │                        │  API → DB)          │
│ ┌─────────────┐ │                        └─────────────────────┘
│ │ USDCx       │ │
│ │ (SIP-010)   │ │
│ └─────────────┘ │
└─────────────────┘
```

---

## Token Addresses

| Token | Network | Address |
|---|---|---|
| USDCx | Mainnet | `SP120SBRBQJ00MCWS7TM5R8WJNTTKD5K0HFRC2CNE.usdcx` |
| USDCx | Testnet | `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx` |
| SIP-010 Trait | Mainnet | `SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard` |

---

## Task Lifecycle (Unchanged from Stellar)

```
Created → Assigned → InProgress → Completed → Approved → FundsReleased
   │                                                          
   ├→ Expired → (Reclaim or Reassign)
   │
   └→ Cancelled (from Assigned/InProgress)
```

**State Enum Values (Clarity):**
- `u0` = Created
- `u1` = Assigned
- `u2` = InProgress
- `u3` = Completed
- `u4` = Approved
- `u5` = FundsReleased
- `u6` = Expired
- `u7` = Cancelled

---

## Fee Model

```
Total Deduction = Base Fee (2%) + Optional Tip (0%, 1%, 2%, or 3%)

Example: Creator funds a 1,000 STX task with a 2% tip
  - Base fee:     20 STX  (2%)
  - Creator tip:  20 STX  (2%)
  - Escrow held:  960 STX (goes to contributor on completion)
  - Total fees:   40 STX  (platform collects)

Monthly redistribution:
  - 20% of total monthly fees → distributed to top 10 creators
  - 80% of total monthly fees → platform revenue
```

**Fee collection is token-aware:** STX tasks pay fees in STX, USDCx tasks pay fees in USDCx.

---

## Leaderboard Scoring (Off-Chain)

The composite score for each creator is calculated monthly from indexed on-chain data:

```
Score = (tasks_completed_successfully × weight_A)
      + (total_funding_volume_usd × weight_B)
      + (average_tip_percent × weight_C)
```

- `tasks_completed_successfully` — tasks where the creator approved and released funds
- `total_funding_volume_usd` — normalized dollar value (STX converted at market rate, USDCx at 1:1)
- `average_tip_percent` — average tip percentage across all tasks that month

Weights are tunable parameters stored in the indexer config, not on-chain.

**Top 10 creators** receive a proportional share of the 20% fee pool based on their score.

---

## Data Flow Summary

1. **Creator creates task** → Clarity contract escrows funds (STX or USDCx), deducts base fee + tip
2. **Contributors apply** → On-chain transaction recorded
3. **Creator assigns** → Contract updates task state
4. **Contributor completes** → Contract updates state
5. **Creator approves & releases** → Contract transfers escrowed funds to contributor
6. **Chainhooks/Hiro API** → Indexes all events into off-chain database
7. **Monthly cron** → Calculates leaderboard scores from indexed data
8. **Admin triggers on-chain payout** → Contract distributes 20% of fee pool to top 10
9. **AI API** → Reads indexed data, generates general + personal insight narratives

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Smart Contract | Clarity (Stacks) |
| Frontend | React + Vite + TypeScript + Tailwind v4 |
| Wallet | Stacks Connect (Leather/Xverse) |
| Blockchain SDK | Stacks.js (@stacks/transactions, @stacks/connect) |
| Indexing | Chainhooks or Hiro API |
| Database | PostgreSQL or Supabase (for indexed data) |
| AI | Claude API or Gemini API |
| Deployment | Vercel/Netlify (frontend), Stacks mainnet (contract) |
| Dev Tools | Clarinet (local dev/testing), Hiro Platform |
