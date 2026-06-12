import { describe, it, expect, vi, beforeAll } from "vitest";

// Mock the script.js module (needed by parse.js)
vi.mock("../script.js", () => ({
  alphabet: ["a", "b"],
}));

const { Parser } = await import("../parse.js");
const { buildNFA } = await import("../build.js");
const {
  epsilon_nfa_to_dfa,
  minimize_dfa,
  order_states,
  simplify_state_name,
} = await import("../convert.js");

const alphabet = ["a", "b"];

// Helper: builds a DFA from a regex string
function regexToDFA(regex) {
  const ast = new Parser(regex).parse();
  const nfa = buildNFA(ast, alphabet);
  return epsilon_nfa_to_dfa(nfa);
}

// Helper: check DFA structure invariants
function assertValidDFA(dfa) {
  expect(dfa.states).toBeDefined();
  expect(Array.isArray(dfa.states)).toBe(true);
  expect(dfa.states.length).toBeGreaterThan(0);

  expect(dfa.alphabet).toEqual(alphabet);

  expect(dfa.initial).toBeDefined();
  expect(dfa.states).toContain(dfa.initial);

  expect(Array.isArray(dfa.accept)).toBe(true);
  for (const s of dfa.accept) {
    expect(dfa.states).toContain(s);
  }

  // Transition table: each state has a row with one entry per symbol (+ epsilon column)
  expect(dfa.transition.length).toBe(dfa.states.length);
  for (let i = 0; i < dfa.states.length; i++) {
    for (let j = 0; j < dfa.alphabet.length; j++) {
      const cell = dfa.transition[i][j];
      expect(Array.isArray(cell)).toBe(true);
      // DFA: exactly one transition per symbol
      expect(cell.length).toBe(1);
      // Target must be a known state
      expect(dfa.states).toContain(cell[0]);
    }
  }
}

// Simulate the DFA accepting/rejecting a string
function dfaAccepts(dfa, input) {
  let current = dfa.initial;
  for (const ch of input) {
    const stateIdx = dfa.states.indexOf(current);
    const symIdx = dfa.alphabet.indexOf(ch);
    if (stateIdx === -1 || symIdx === -1) return false;
    current = dfa.transition[stateIdx][symIdx][0];
  }
  return dfa.accept.includes(current);
}

describe("epsilon_nfa_to_dfa", () => {
  it("converts simple NFA for 'a' to a valid DFA", () => {
    const dfa = regexToDFA("a");
    assertValidDFA(dfa);
  });

  it("converts NFA for 'a|b' to a valid DFA", () => {
    const dfa = regexToDFA("a|b");
    assertValidDFA(dfa);
  });

  it("converts NFA for 'a*' to a valid DFA", () => {
    const dfa = regexToDFA("a*");
    assertValidDFA(dfa);
  });

  it("converts NFA for '(a|b)*' to a valid DFA", () => {
    const dfa = regexToDFA("(a|b)*");
    assertValidDFA(dfa);
  });

  describe("DFA accepts correct strings for 'a'", () => {
    let dfa;
    beforeAll(() => {
      dfa = regexToDFA("a");
    });

    it("accepts 'a'", () => expect(dfaAccepts(dfa, "a")).toBe(true));
    it("rejects ''", () => expect(dfaAccepts(dfa, "")).toBe(false));
    it("rejects 'b'", () => expect(dfaAccepts(dfa, "b")).toBe(false));
    it("rejects 'aa'", () => expect(dfaAccepts(dfa, "aa")).toBe(false));
  });

  describe("DFA accepts correct strings for 'a|b'", () => {
    let dfa;
    beforeAll(() => {
      dfa = regexToDFA("a|b");
    });

    it("accepts 'a'", () => expect(dfaAccepts(dfa, "a")).toBe(true));
    it("accepts 'b'", () => expect(dfaAccepts(dfa, "b")).toBe(true));
    it("rejects ''", () => expect(dfaAccepts(dfa, "")).toBe(false));
    it("rejects 'ab'", () => expect(dfaAccepts(dfa, "ab")).toBe(false));
  });

  describe("DFA accepts correct strings for 'ab'", () => {
    let dfa;
    beforeAll(() => {
      dfa = regexToDFA("ab");
    });

    it("accepts 'ab'", () => expect(dfaAccepts(dfa, "ab")).toBe(true));
    it("rejects 'a'", () => expect(dfaAccepts(dfa, "a")).toBe(false));
    it("rejects 'b'", () => expect(dfaAccepts(dfa, "b")).toBe(false));
    it("rejects ''", () => expect(dfaAccepts(dfa, "")).toBe(false));
    it("rejects 'ba'", () => expect(dfaAccepts(dfa, "ba")).toBe(false));
  });

  describe("DFA accepts correct strings for 'a*'", () => {
    let dfa;
    beforeAll(() => {
      dfa = regexToDFA("a*");
    });

    it("accepts ''", () => expect(dfaAccepts(dfa, "")).toBe(true));
    it("accepts 'a'", () => expect(dfaAccepts(dfa, "a")).toBe(true));
    it("accepts 'aaa'", () => expect(dfaAccepts(dfa, "aaa")).toBe(true));
    it("rejects 'b'", () => expect(dfaAccepts(dfa, "b")).toBe(false));
    it("rejects 'ab'", () => expect(dfaAccepts(dfa, "ab")).toBe(false));
  });

  describe("DFA accepts correct strings for '(a|b)*'", () => {
    let dfa;
    beforeAll(() => {
      dfa = regexToDFA("(a|b)*");
    });

    it("accepts ''", () => expect(dfaAccepts(dfa, "")).toBe(true));
    it("accepts 'a'", () => expect(dfaAccepts(dfa, "a")).toBe(true));
    it("accepts 'b'", () => expect(dfaAccepts(dfa, "b")).toBe(true));
    it("accepts 'abba'", () => expect(dfaAccepts(dfa, "abba")).toBe(true));
    it("accepts 'bababab'", () =>
      expect(dfaAccepts(dfa, "bababab")).toBe(true));
  });

  describe("DFA accepts correct strings for 'ab*a'", () => {
    let dfa;
    beforeAll(() => {
      dfa = regexToDFA("ab*a");
    });

    it("accepts 'aa'", () => expect(dfaAccepts(dfa, "aa")).toBe(true));
    it("accepts 'aba'", () => expect(dfaAccepts(dfa, "aba")).toBe(true));
    it("accepts 'abba'", () => expect(dfaAccepts(dfa, "abba")).toBe(true));
    it("rejects 'a'", () => expect(dfaAccepts(dfa, "a")).toBe(false));
    it("rejects 'ab'", () => expect(dfaAccepts(dfa, "ab")).toBe(false));
    it("rejects ''", () => expect(dfaAccepts(dfa, "")).toBe(false));
  });

  it("handles direct NFA input (from nfa-to-dfa module style)", () => {
    const nfa = {
      states: ["q0", "q1", "q2"],
      alphabet: ["0", "1"],
      transition: [
        [[], ["q1"], ["q1"]],
        [["q2"], ["q1"], []],
        [["q0"], [], []],
      ],
      initial: "q0",
      accept: ["q2"],
    };
    const dfa = epsilon_nfa_to_dfa(nfa);
    expect(dfa.states.length).toBeGreaterThan(0);
    expect(dfa.initial).toBeDefined();
    expect(dfa.alphabet).toEqual(["0", "1"]);
  });
});

describe("minimize_dfa", () => {
  it("minimizes DFA for 'a' without errors", () => {
    const dfa = regexToDFA("a");
    const minDfa = minimize_dfa(dfa);
    assertValidDFA(minDfa);
    expect(minDfa.states.length).toBeLessThanOrEqual(dfa.states.length);
  });

  it("minimizes DFA for '(a|b)*' preserving behavior", () => {
    const dfa = regexToDFA("(a|b)*");
    const minDfa = minimize_dfa(dfa);
    assertValidDFA(minDfa);

    // The minimized DFA should accept the same strings
    expect(dfaAccepts(minDfa, "")).toBe(true);
    expect(dfaAccepts(minDfa, "a")).toBe(true);
    expect(dfaAccepts(minDfa, "b")).toBe(true);
    expect(dfaAccepts(minDfa, "abba")).toBe(true);
  });

  it("minimizes DFA for 'a*' — single-state accepting all a's", () => {
    const dfa = regexToDFA("a*");
    const minDfa = minimize_dfa(dfa);
    assertValidDFA(minDfa);

    expect(dfaAccepts(minDfa, "")).toBe(true);
    expect(dfaAccepts(minDfa, "a")).toBe(true);
    expect(dfaAccepts(minDfa, "aaa")).toBe(true);
    expect(dfaAccepts(minDfa, "b")).toBe(false);
  });

  it("minimized DFA has fewer or equal states", () => {
    const dfa = regexToDFA("a(ab*|ba)*|b(a|b)*");
    const minDfa = minimize_dfa(dfa);
    expect(minDfa.states.length).toBeLessThanOrEqual(dfa.states.length);
  });

  it("preserves language for 'ab*a'", () => {
    const dfa = regexToDFA("ab*a");
    const minDfa = minimize_dfa(dfa);
    assertValidDFA(minDfa);

    expect(dfaAccepts(minDfa, "aa")).toBe(true);
    expect(dfaAccepts(minDfa, "aba")).toBe(true);
    expect(dfaAccepts(minDfa, "abba")).toBe(true);
    expect(dfaAccepts(minDfa, "a")).toBe(false);
    expect(dfaAccepts(minDfa, "b")).toBe(false);
    expect(dfaAccepts(minDfa, "")).toBe(false);
  });
});

describe("order_states", () => {
  it("returns a valid DFA", () => {
    const dfa = regexToDFA("a|b");
    const ordered = order_states(dfa);
    assertValidDFA(ordered);
  });

  it("initial state is first in the states array", () => {
    const dfa = regexToDFA("(a|b)*");
    const ordered = order_states(dfa);
    expect(ordered.states[0]).toBe(ordered.initial);
  });

  it("preserves language after ordering", () => {
    const dfa = regexToDFA("ab*a");
    const ordered = order_states(dfa);
    expect(dfaAccepts(ordered, "aa")).toBe(true);
    expect(dfaAccepts(ordered, "aba")).toBe(true);
    expect(dfaAccepts(ordered, "a")).toBe(false);
    expect(dfaAccepts(ordered, "")).toBe(false);
  });

  it("works correctly after minimization", () => {
    const dfa = regexToDFA("(a|b)*a(a|b)");
    const minDfa = minimize_dfa(dfa);
    const ordered = order_states(minDfa);
    assertValidDFA(ordered);
    expect(ordered.states[0]).toBe(ordered.initial);
  });
});

describe("simplify_state_name", () => {
  it("renames states to q0, q1, q2, ...", () => {
    const dfa = regexToDFA("a|b");
    const minDfa = minimize_dfa(dfa);
    const ordered = order_states(minDfa);
    const simplified = simplify_state_name(ordered);

    for (let i = 0; i < simplified.states.length; i++) {
      expect(simplified.states[i]).toBe("q" + i);
    }
  });

  it("initial state is q0", () => {
    const dfa = regexToDFA("(a|b)*");
    const minDfa = minimize_dfa(dfa);
    const ordered = order_states(minDfa);
    const simplified = simplify_state_name(ordered);
    expect(simplified.initial).toBe("q0");
  });

  it("transitions reference simplified names", () => {
    const dfa = regexToDFA("ab");
    const minDfa = minimize_dfa(dfa);
    const ordered = order_states(minDfa);
    const simplified = simplify_state_name(ordered);

    const validNames = new Set(simplified.states);
    for (const row of simplified.transition) {
      for (const cell of row) {
        for (const s of cell) {
          expect(validNames.has(s)).toBe(true);
        }
      }
    }
  });

  it("preserves accept states correctly", () => {
    const dfa = regexToDFA("a*");
    const minDfa = minimize_dfa(dfa);
    const ordered = order_states(minDfa);
    const simplified = simplify_state_name(ordered);

    expect(simplified.accept.length).toBeGreaterThan(0);
    for (const s of simplified.accept) {
      expect(simplified.states).toContain(s);
    }
  });
});

describe("full pipeline: regex -> minimized DFA", () => {
  function fullPipeline(regex) {
    const ast = new Parser(regex).parse();
    const nfa = buildNFA(ast, alphabet);
    const dfa = epsilon_nfa_to_dfa(nfa);
    const minDfa = minimize_dfa(dfa);
    const ordered = order_states(minDfa);
    return simplify_state_name(ordered);
  }

  it("produces a valid minimized DFA for 'a(ab*|ba)*|b(a|b)*'", () => {
    const dfa = fullPipeline("a(ab*|ba)*|b(a|b)*");
    assertValidDFA(dfa);

    // This regex matches strings where: starts with 'a' followed by pairs, or 'b' followed by any
    expect(dfaAccepts(dfa, "b")).toBe(true);
    expect(dfaAccepts(dfa, "ba")).toBe(true);
    expect(dfaAccepts(dfa, "a")).toBe(true);
    expect(dfaAccepts(dfa, "aab")).toBe(true);
    expect(dfaAccepts(dfa, "")).toBe(false);
  });

  it("produces a valid minimized DFA for '(a|b)*a(a|b)'", () => {
    const dfa = fullPipeline("(a|b)*a(a|b)");
    assertValidDFA(dfa);

    // Matches any string over {a,b} that has 'a' as the second-to-last character
    expect(dfaAccepts(dfa, "aa")).toBe(true);
    expect(dfaAccepts(dfa, "ab")).toBe(true);
    expect(dfaAccepts(dfa, "baa")).toBe(true);
    expect(dfaAccepts(dfa, "bab")).toBe(true);
    expect(dfaAccepts(dfa, "a")).toBe(false);
    expect(dfaAccepts(dfa, "b")).toBe(false);
    expect(dfaAccepts(dfa, "bb")).toBe(false);
    expect(dfaAccepts(dfa, "ba")).toBe(false);
  });

  it("state names are simplified to q0, q1, ...", () => {
    const dfa = fullPipeline("ab*a");
    expect(dfa.initial).toBe("q0");
    for (let i = 0; i < dfa.states.length; i++) {
      expect(dfa.states[i]).toBe("q" + i);
    }
  });
});
