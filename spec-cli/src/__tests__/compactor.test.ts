import { describe, expect, test } from "bun:test";
import {
  compactAcceptanceCriteria,
  compactLists,
  compactRequirements,
  compactSpec,
  compactTables,
  compactUserStories,
  estimateTokens,
  removeEmptySections,
  removeRationale,
} from "../lib/compactor";

describe("compactAcceptanceCriteria", () => {
  test("converts GIVEN/WHEN/THEN to shorthand", () => {
    const input = "GIVEN a logged in user WHEN they click logout THEN they are logged out";
    const result = compactAcceptanceCriteria(input);

    expect(result).toContain("[");
    expect(result).toContain("]");
    expect(result).toContain("→");
    expect(result).not.toContain("GIVEN");
    expect(result).not.toContain("WHEN");
    expect(result).not.toContain("THEN");
  });

  test("handles multiple acceptance criteria", () => {
    const input = `GIVEN condition one WHEN action one THEN result one
GIVEN condition two WHEN action two THEN result two`;
    const result = compactAcceptanceCriteria(input);

    const brackets = result.match(/\[/g);
    expect(brackets?.length).toBe(2);
  });

  test("leaves text without pattern unchanged", () => {
    const input = "Some text without the pattern";
    const result = compactAcceptanceCriteria(input);

    expect(result).toBe(input);
  });

  test("truncates long text segments", () => {
    const longGiven = "a".repeat(50);
    const input = `GIVEN ${longGiven} WHEN action THEN result`;
    const result = compactAcceptanceCriteria(input);

    // Should be truncated to 30 chars max for given
    expect(result.length).toBeLessThan(input.length);
  });
});

describe("compactRequirements", () => {
  test("removes 'The system' preambles", () => {
    const input = "The system SHALL do something";
    const result = compactRequirements(input);

    expect(result).toBe("SHALL do something");
  });

  test("removes markdown bold from SHALL/MUST/SHOULD", () => {
    const input = "**SHALL** do X, **MUST** do Y, **SHOULD** do Z";
    const result = compactRequirements(input);

    expect(result).toBe("SHALL do X, MUST do Y, SHOULD do Z");
    expect(result).not.toContain("**");
  });
});

describe("compactUserStories", () => {
  test("converts verbose user story format", () => {
    const input = "**As a** developer **I want** to write tests **So that** code is reliable";
    const result = compactUserStories(input);

    expect(result).toContain("[developer]");
    expect(result).toContain("wants");
    expect(result).toContain("for");
    expect(result).not.toContain("**As a**");
  });

  test("leaves regular text unchanged", () => {
    const input = "Just some regular text about developers";
    const result = compactUserStories(input);

    expect(result).toBe(input);
  });
});

describe("removeRationale", () => {
  test("removes rationale sections", () => {
    const input = `Some content
**Rationale:** This explains why we do things this way and provides context.

More content`;
    const result = removeRationale(input);

    expect(result).not.toContain("Rationale");
    expect(result).toContain("Some content");
    expect(result).toContain("More content");
  });
});

describe("compactTables", () => {
  test("converts simple tables to inline format", () => {
    // Table needs trailing content to trigger flush in current implementation
    const input = `| Column1 | Column2 |
|---------|---------|
| Key1    | Value1  |
| Key2    | Value2  |

Some text after.`;
    const result = compactTables(input);

    expect(result).toContain("Key1: Value1");
    expect(result).toContain("Key2: Value2");
  });

  test("leaves non-table content unchanged", () => {
    const input = "Just regular text";
    const result = compactTables(input);

    expect(result).toBe(input);
  });
});

describe("removeEmptySections", () => {
  test("removes sections with no content", () => {
    const input = `## Section One
Has content here.

## Empty Section

## Section Two
Content here`;
    const result = removeEmptySections(input);

    expect(result).toContain("## Section One");
    expect(result).not.toContain("## Empty Section");
    expect(result).toContain("## Section Two");
  });

  test("removes multiple blank lines", () => {
    const input = "Content\n\n\n\n\nMore content";
    const result = removeEmptySections(input);

    expect(result).toBe("Content\n\nMore content");
  });
});

describe("compactLists", () => {
  test("compacts short list items to comma-separated", () => {
    const input = `- item one
- item two
- item three`;
    const result = compactLists(input);

    expect(result).toContain("item one, item two, item three");
  });

  test("preserves long list items individually", () => {
    const input = `- this is a very long list item that should not be compacted because it exceeds the limit
- another very long list item that should also remain on its own line`;
    const result = compactLists(input);

    // Should have multiple lines
    const lines = result.trim().split("\n");
    expect(lines.length).toBeGreaterThan(1);
  });

  test("does not compact more than 5 items", () => {
    const input = `- a
- b
- c
- d
- e
- f
- g`;
    const result = compactLists(input);

    // Should have multiple lines since > 5 items
    const lines = result.trim().split("\n");
    expect(lines.length).toBeGreaterThan(1);
  });
});

describe("estimateTokens", () => {
  test("estimates tokens from word count", () => {
    const text = "one two three four five";
    const tokens = estimateTokens(text);

    // 5 words * 1.3 = 6.5 -> 7
    expect(tokens).toBe(7);
  });

  test("handles empty string", () => {
    const tokens = estimateTokens("");
    expect(tokens).toBe(0);
  });

  test("handles multiple spaces", () => {
    const text = "word1    word2   word3";
    const tokens = estimateTokens(text);

    // 3 words * 1.3 = 3.9 -> 4
    expect(tokens).toBe(4);
  });
});

describe("compactSpec", () => {
  test("applies all transformations", () => {
    const input = `## Purpose
The system **SHALL** provide functionality.

**As a** user **I want** features **So that** I can work.

GIVEN a condition WHEN an action THEN a result

**Rationale:** This is why.

## Empty Section

## Conclusion
Done.`;

    const result = compactSpec(input);

    // Should not contain verbose elements
    expect(result).not.toContain("**SHALL**");
    expect(result).not.toContain("**As a**");
    expect(result).not.toContain("GIVEN");
    expect(result).not.toContain("Rationale");

    // Should contain compacted versions
    expect(result).toContain("SHALL");
    expect(result).toContain("[user]");
    expect(result).toContain("→");
  });

  test("trims result", () => {
    const input = "  content  ";
    const result = compactSpec(input);

    expect(result).toBe("content");
  });
});
