# Taskify — The Decentralized Bounty Board on Stacks (Bitcoin L2)

![Taskify Banner](https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop)

> **Taskify is the "Velocity Layer" for the Bitcoin ecosystem.** It connects creators with expert builders through secure, Bitcoin-anchored smart contracts, enabling a "Fix, Merge, and Earn" cycle that scales with the ecosystem.

---

## 🌊 The Vision: Building the "Bitcoin Wave"

Inspired by the success of the **Drips Wave** program on Stellar—which onboarded 1,000+ developers and revitalized 400+ projects—Taskify is designed to be the primary engine for developer growth on Stacks. 

While many platforms focus on static grants, Taskify focuses on **high-velocity work**. We provide the infrastructure for recurring bounty cycles that help developers move from learning Clarity to building production-ready dApps on Bitcoin.

### Key Pillars:
*   **Dual-Token Escrow**: Fund tasks with **STX** or **USDCx** (SIP-010 stablecoin) for predictable payments.
*   **Trustless Settlement**: Funds are held in a Clarity smart contract and only released upon verifiable approval.
*   **On-Chain Reputation**: Every task completed builds a verifiable "Work Score" and on-chain resume for developers.
*   **AI-Driven Insights**: Narrative-driven analytics that turn dry on-chain data into actionable coaching for creators and contributors.

---

## 💰 The Financial Model: A Circular Economy

Taskify is built to be self-sufficient and ecosystem-aligned. We move away from the "grant-dependence" model by implementing a circular fee economy.

### Fee Structure
*   **Base Fee**: 2% on all funded tasks.
*   **Creator Tip**: Optional 1% to 3% additional tip to incentivize top-tier talent.

### The Redistribution Flywheel (80/20 Split)
Fees collected by the platform are split to ensure both growth and sustainability:
1.  **20% → The Leaderboard Pool**: Distributed monthly to the top 10 creators. This rewards "Active Generosity"—creators who post frequent, well-funded, and highly-tipped tasks.
2.  **80% → Ecosystem Growth & Maintenance**: Used to fund platform-sponsored "Core Bounties" for the Stacks ecosystem and maintain the Taskify infrastructure.

*This model ensures that as Taskify grows, the rewards for being an active participant in the Stacks ecosystem grow proportionally.*

---

## 🚀 Impact on the Stacks Ecosystem

Taskify serves as a critical infrastructure layer for the Stacks Foundation and ecosystem partners:

*   **Automated Micro-Grants**: Projects can use Taskify to automate the distribution of small grants and bounties, reducing administrative overhead.
*   **Clarity Talent Pipeline**: By providing a constant stream of "First-Bounty" tasks, we create a clear professional path for developers exiting Clarity Camp or Stacks Degree.
*   **Reduced Technical Debt**: Core Stacks projects can list their GitHub backlogs on Taskify, attracting global talent to clear issues and improve the overall "Standard of Work" on Bitcoin.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Smart Contracts** | Clarity (Stacks L2) |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS v4, Framer Motion |
| **Backend** | Node.js, Express, Supabase (Indexer & Scoring) |
| **Blockchain SDK** | Stacks.js (@stacks/transactions, @stacks/connect) |
| **AI Layer** | Claude 3.5 / Gemini 1.5 Pro |

---

## 📂 Project Structure

```bash
ise_owo/
├── contract/       # Clarity smart contracts & Clarinet tests
├── backend/        # Node.js indexer, scoring engine, and Supabase config
├── frontend/       # Next.js web application
└── files/          # Technical specifications and architecture docs
```

---

## 🚦 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [pnpm](https://pnpm.io/) (v8+)
*   [Clarinet](https://github.com/hirosystems/clarinet) (for contract development)

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/taskify.git
    cd taskify
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Run the development servers:
    ```bash
    # Frontend
    pnpm dev:frontend
    
    # Backend
    pnpm dev:backend
    ```

---

## 🗺 Roadmap

- [x] **Phase 1**: Migration of core logic from Stellar to Stacks (Clarity).
- [x] **Phase 2**: Implementation of Dual-Token Escrow (STX/USDCx).
- [ ] **Phase 3**: Launch of the AI Insight Engine for personalized coaching.
- [ ] **Phase 4**: Pilot "The Bitcoin Wave" with 5 core Stacks ecosystem projects.
- [ ] **Phase 5**: Full Mainnet deployment and decentralized leaderboard payouts.

---

Built with 🧡 on Stacks.
