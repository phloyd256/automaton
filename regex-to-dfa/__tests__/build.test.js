import { describe, it, expect, vi } from "vitest";

// Mock the script.js module to provide alphabet without DOM
vi.mock("../script.js", () => ({
  alphabet: ["a", "b"],
}));

const { Parser } = await import("../parse.js");
const { buildNFA } = await import("../build.js");

const alphabet = ["a", "b"];

// Helper: check NFA structure invariants
function assertValidNFA(nfa) {
  expect(nfa.states).toBeDefined();
  expect(Array.isArray(nfa.states)).toBe(true);
  expect(nfa.states.length).toBeGreaterThan(0);

  expect(nfa.alphabet).toEqual(alphabet);

  expect(nfa.transition).toBeDefined();
  expect(nfa.transition.length).toBe(nfa.states.length);
  // Each row has alphabet.length + 1 columns (symbols + epsilon)
  for (const row of nfa.transition) {
    expect(row.length).toBe(alphabet.length + 1);
    for (const cell of row) {
      expect(Array.isArray(cell)).toBe(true);
    }
  }

  expect(nfa.initial).toBeDefined();
  expect(nfa.states).toContain(nfa.initial);

  expect(Array.isArray(nfa.accept)).toBe(true);
  expect(nfa.accept.length).toBeGreaterThan(0);
  for (const s of nfa.accept) {
    expect(nfa.states).toContain(s);
  }
}

describe("buildNFA", () => {
  describe("single character NFA", () => {
    it("builds NFA for 'a'", () => {
      const ast = new Parser("a").parse();
      const nfa = buildNFA(ast, alphabet);
      assertValidNFA(nfa);
      expect(nfa.states.length).toBe(2);
      // Transition from initial on 'a' should reach accept state
      const initIdx = nfa.states.indexOf(nfa.initial);
      const aIdx = alphabet.indexOf("a");
      expect(nfa.transition[initIdx][aIdx]).toEqual(nfa.accept);
    });

    it("builds NFA for 'b'", () => {
      const ast = new Parser("b").parse();
      const nfa = buildNFA(ast, alphabet);
      assertValidNFA(nfa);
      expect(nfa.states.length).toBe(2);
      const initIdx = nfa.states.indexOf(nfa.initial);
      const bIdx = alphabet.indexOf("b");
      expect(nfa.transition[initIdx][bIdx]).toEqual(nfa.accept);
    });
  });

  describe("concatenation NFA", () => {
    it("builds NFA for 'ab'", () => {
      const ast = new Parser("ab").parse();
      const nfa = buildNFA(ast, alphabet);
      assertValidNFA(nfa);
      // Concat of two chars → 4 states
      expect(nfa.states.length).toBe(4);
    });

    it("has epsilon transition connecting the two sub-NFAs", () => {
      const ast = new Parser("ab").parse();
      const nfa = buildNFA(ast, alphabet);
      // The accept state of the first NFA should have an epsilon transition to the initial of the second
      const epsilonIdx = alphabet.length; // epsilon column
      const hasEpsilonBridge = nfa.transition.some(
        (row) => row[epsilonIdx].length > 0
      );
      expect(hasEpsilonBridge).toBe(true);
    });
  });

  describe("union NFA", () => {
    it("builds NFA for 'a|b'", () => {
      const ast = new Parser("a|b").parse();
      const nfa = buildNFA(ast, alphabet);
      assertValidNFA(nfa);
      // Union adds 2 new states (new start + new accept) → 2 + 2 + 2 = 6 states
      expect(nfa.states.length).toBe(6);
    });

    it("new start has epsilon transitions to both branches", () => {
      const ast = new Parser("a|b").parse();
      const nfa = buildNFA(ast, alphabet);
      const initIdx = nfa.states.indexOf(nfa.initial);
      const epsilonIdx = alphabet.length;
      // Initial state should have 2 epsilon transitions
      expect(nfa.transition[initIdx][epsilonIdx].length).toBe(2);
    });
  });

  describe("Kleene star NFA", () => {
    it("builds NFA for 'a*'", () => {
      const ast = new Parser("a*").parse();
      const nfa = buildNFA(ast, alphabet);
      assertValidNFA(nfa);
      // Star adds 1 new state → 2 + 1 = 3 states
      expect(nfa.states.length).toBe(3);
    });

    it("accept state is the new start (epsilon-loop)", () => {
      const ast = new Parser("a*").parse();
      const nfa = buildNFA(ast, alphabet);
      // Accept state IS the initial state for star
      expect(nfa.accept).toContain(nfa.initial);
    });
  });

  describe("complex expressions", () => {
    it("builds valid NFA for '(a|b)*'", () => {
      const ast = new Parser("(a|b)*").parse();
      const nfa = buildNFA(ast, alphabet);
      assertValidNFA(nfa);
    });

    it("builds valid NFA for 'a(ab*|ba)*|b(a|b)*'", () => {
      const ast = new Parser("a(ab*|ba)*|b(a|b)*").parse();
      const nfa = buildNFA(ast, alphabet);
      assertValidNFA(nfa);
    });

    it("builds valid NFA for '(a|b)*a(a|b)'", () => {
      const ast = new Parser("(a|b)*a(a|b)").parse();
      const nfa = buildNFA(ast, alphabet);
      assertValidNFA(nfa);
    });
  });

  describe("state counter reset", () => {
    it("resets state counter between calls", () => {
      const ast1 = new Parser("a").parse();
      const nfa1 = buildNFA(ast1, alphabet);
      const ast2 = new Parser("b").parse();
      const nfa2 = buildNFA(ast2, alphabet);
      // Both should start with q0
      expect(nfa1.states[0]).toBe("q0");
      expect(nfa2.states[0]).toBe("q0");
    });
  });
});
