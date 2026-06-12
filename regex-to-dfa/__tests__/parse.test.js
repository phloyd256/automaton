import { describe, it, expect, vi } from "vitest";

// Mock the script.js module to provide alphabet without DOM
vi.mock("../script.js", () => ({
  alphabet: ["a", "b"],
}));

const { Parser } = await import("../parse.js");

describe("Parser", () => {
  describe("single character", () => {
    it("parses 'a' as a CharNode", () => {
      const ast = new Parser("a").parse();
      expect(ast).toEqual({ type: "char", ch: "a" });
    });

    it("parses 'b' as a CharNode", () => {
      const ast = new Parser("b").parse();
      expect(ast).toEqual({ type: "char", ch: "b" });
    });
  });

  describe("concatenation", () => {
    it("parses 'ab' as a ConcatNode", () => {
      const ast = new Parser("ab").parse();
      expect(ast.type).toBe("concat");
      expect(ast.left).toEqual({ type: "char", ch: "a" });
      expect(ast.right).toEqual({ type: "char", ch: "b" });
    });

    it("parses 'aba' as left-associative concat", () => {
      const ast = new Parser("aba").parse();
      expect(ast.type).toBe("concat");
      expect(ast.left.type).toBe("concat");
      expect(ast.left.left).toEqual({ type: "char", ch: "a" });
      expect(ast.left.right).toEqual({ type: "char", ch: "b" });
      expect(ast.right).toEqual({ type: "char", ch: "a" });
    });
  });

  describe("union (alternation)", () => {
    it("parses 'a|b' as a UnionNode", () => {
      const ast = new Parser("a|b").parse();
      expect(ast.type).toBe("union");
      expect(ast.left).toEqual({ type: "char", ch: "a" });
      expect(ast.right).toEqual({ type: "char", ch: "b" });
    });

    it("parses 'a|b|a' as left-associative union", () => {
      const ast = new Parser("a|b|a").parse();
      expect(ast.type).toBe("union");
      expect(ast.left.type).toBe("union");
      expect(ast.left.left).toEqual({ type: "char", ch: "a" });
      expect(ast.left.right).toEqual({ type: "char", ch: "b" });
      expect(ast.right).toEqual({ type: "char", ch: "a" });
    });
  });

  describe("Kleene star", () => {
    it("parses 'a*' as a StarNode", () => {
      const ast = new Parser("a*").parse();
      expect(ast.type).toBe("star");
      expect(ast.expr).toEqual({ type: "char", ch: "a" });
    });

    it("parses 'a**' as nested StarNodes", () => {
      const ast = new Parser("a**").parse();
      expect(ast.type).toBe("star");
      expect(ast.expr.type).toBe("star");
      expect(ast.expr.expr).toEqual({ type: "char", ch: "a" });
    });
  });

  describe("parentheses", () => {
    it("parses '(a)' as a CharNode", () => {
      const ast = new Parser("(a)").parse();
      expect(ast).toEqual({ type: "char", ch: "a" });
    });

    it("parses '(a|b)*' — union inside star", () => {
      const ast = new Parser("(a|b)*").parse();
      expect(ast.type).toBe("star");
      expect(ast.expr.type).toBe("union");
      expect(ast.expr.left).toEqual({ type: "char", ch: "a" });
      expect(ast.expr.right).toEqual({ type: "char", ch: "b" });
    });

    it("parses '(ab)*' — concat inside star", () => {
      const ast = new Parser("(ab)*").parse();
      expect(ast.type).toBe("star");
      expect(ast.expr.type).toBe("concat");
    });
  });

  describe("operator precedence", () => {
    it("star binds tighter than concat: 'ab*' = a(b*)", () => {
      const ast = new Parser("ab*").parse();
      expect(ast.type).toBe("concat");
      expect(ast.left).toEqual({ type: "char", ch: "a" });
      expect(ast.right.type).toBe("star");
      expect(ast.right.expr).toEqual({ type: "char", ch: "b" });
    });

    it("concat binds tighter than union: 'ab|b' = (ab)|b", () => {
      const ast = new Parser("ab|b").parse();
      expect(ast.type).toBe("union");
      expect(ast.left.type).toBe("concat");
      expect(ast.right).toEqual({ type: "char", ch: "b" });
    });
  });

  describe("complex expressions", () => {
    it("parses 'a(ab*|ba)*|b(a|b)*'", () => {
      const ast = new Parser("a(ab*|ba)*|b(a|b)*").parse();
      expect(ast.type).toBe("union");
    });

    it("parses '(a|b)*a(a|b)'", () => {
      const ast = new Parser("(a|b)*a(a|b)").parse();
      expect(ast.type).toBe("concat");
    });
  });

  describe("error handling", () => {
    it("throws on unexpected character", () => {
      expect(() => new Parser("x").parse()).toThrow();
    });

    it("throws on missing closing paren", () => {
      expect(() => new Parser("(a").parse()).toThrow("expected )");
    });
  });
});
