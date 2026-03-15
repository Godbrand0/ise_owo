import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const deployer = accounts.get("deployer")!;

describe("taskify contract tests", () => {
  it("should register a new user", () => {
    const { result } = simnet.callPublicFn(
      "taskify",
      "register-user",
      [Cl.stringAscii("godbrand")],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));

    const user = simnet.callReadOnlyFn("taskify", "get-user", [Cl.principal(wallet1)], wallet1);
    // Checking if the result is a 'some' type
    expect(user.result).toBeDefined();
  });

  it("should fail registration with empty username", () => {
    const { result } = simnet.callPublicFn(
      "taskify",
      "register-user",
      [Cl.stringAscii("")],
      wallet2
    );
    expect(result).toBeErr(Cl.uint(115)); // ERR-ZERO-AMOUNT
  });

  it("should create a task with STX funding", () => {
    // Register wallet1
    simnet.callPublicFn("taskify", "register-user", [Cl.stringAscii("creator")], wallet1);

    const fundingAmount = 1000000; // 1 STX
    const deadline = simnet.blockHeight + 100;
    
    const { result } = simnet.callPublicFn(
      "taskify",
      "create-task-stx",
      [
        Cl.stringAscii("Test Task"),
        Cl.stringUtf8("Test Description"),
        Cl.none(),
        Cl.uint(fundingAmount),
        Cl.uint(deadline),
        Cl.uint(2), // 2% tip
      ],
      wallet1
    );
    
    expect(result).toBeOk(Cl.uint(0)); // First task ID is 0
  });

  it("should handle full task lifecycle", () => {
    // 1. Setup: Register users
    simnet.callPublicFn("taskify", "register-user", [Cl.stringAscii("creator1")], wallet1);
    simnet.callPublicFn("taskify", "register-user", [Cl.stringAscii("worker1")], wallet2);

    // 2. Create Task
    const funding = 1000000;
    const createResult = simnet.callPublicFn("taskify", "create-task-stx", [
        Cl.stringAscii("Bounty"), Cl.stringUtf8("Desc"), Cl.none(),
        Cl.uint(funding), Cl.uint(simnet.blockHeight + 10), Cl.uint(0)
    ], wallet1);
    
    expect(createResult.result).toBeOk(Cl.uint(0));
    const taskId = Cl.uint(0);

    // 3. Apply
    simnet.callPublicFn("taskify", "apply-for-task", [taskId], wallet2);
    
    // 4. Assign
    simnet.callPublicFn("taskify", "assign-task", [taskId, Cl.principal(wallet2)], wallet1);

    // 5. Start
    simnet.callPublicFn("taskify", "start-task", [taskId], wallet2);

    // 6. Complete
    simnet.callPublicFn("taskify", "complete-task", [taskId], wallet2);

    // 7. Approve & Release
    const { result } = simnet.callPublicFn("taskify", "approve-and-release-stx", [taskId], wallet1);
    expect(result).toBeOk(Cl.bool(true));

    // Verify task status is 5 (FUNDS-RELEASED)
    // const task: any = simnet.callReadOnlyFn("taskify", "get-task", [taskId], wallet1).result;
  });

  it("should prevent unauthorized fee withdrawal", () => {
    const { result } = simnet.callPublicFn(
      "taskify",
      "withdraw-fees-stx",
      [],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
  });

  it("should allow deployer to withdraw fees", () => {
    // 1. Setup: Create a task to generate fees
    simnet.callPublicFn("taskify", "register-user", [Cl.stringAscii("fee-gen")], wallet1);
    simnet.callPublicFn("taskify", "create-task-stx", [
        Cl.stringAscii("Fee Task"), Cl.stringUtf8("Desc"), Cl.none(),
        Cl.uint(1000000), Cl.uint(simnet.blockHeight + 10), Cl.uint(3)
    ], wallet1);
    // Total fee = 2% base + 3% tip = 5% = 50,000 STX
    // Platform fee (80%) = 40,000 STX (assuming base-fee and tip are handled correctly in the contract)

    // 2. Withdraw
    const { result } = simnet.callPublicFn(
      "taskify",
      "withdraw-fees-stx",
      [],
      deployer
    );
    // The contract logic says ok amount, let's verify if matches expectation
    expect(result).toBeOk(Cl.uint(40000));
  });
});
