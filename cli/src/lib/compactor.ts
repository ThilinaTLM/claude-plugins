/**
 * Compact a specification file for token-optimized contexts.
 * Reduces token count by ~60% while preserving essential information.
 * Ported from compact.py
 */

/**
 * Convert verbose acceptance criteria to shorthand notation
 * GIVEN ... WHEN ... THEN ... → [given+when→then]
 */
export function compactAcceptanceCriteria(text: string): string {
  const pattern = /GIVEN\s+(.+?)\s+WHEN\s+(.+?)\s+THEN\s+(.+?)(?=\n|$)/gi;

  return text.replace(pattern, (_, given, when, then) => {
    const g = given.trim().replace(/\s+/g, "-").slice(0, 30);
    const w = when.trim().replace(/\s+/g, "-").slice(0, 20);
    const t = then.trim().replace(/\s+/g, "-").slice(0, 30);
    return `[${g}+${w}→${t}]`;
  });
}

/**
 * Shorten requirement statements
 */
export function compactRequirements(text: string): string {
  // Remove "The system" preambles
  let result = text.replace(/The system\s+/g, "");
  // Compact SHALL/MUST/SHOULD
  result = result.replace(/\*\*SHALL\*\*/g, "SHALL");
  result = result.replace(/\*\*MUST\*\*/g, "MUST");
  result = result.replace(/\*\*SHOULD\*\*/g, "SHOULD");
  return result;
}

/**
 * Convert verbose user stories to compact format
 * As a ... I want ... So that ... → [role] wants [want] for [benefit]
 */
export function compactUserStories(text: string): string {
  const pattern =
    /\*\*As a\*\*\s+(.+?)\s+\*\*I want\*\*\s+(.+?)\s+\*\*So that\*\*\s+(.+?)(?=\n\n|$)/gis;

  return text.replace(pattern, (_, role, want, benefit) => {
    const r = role.trim().slice(0, 20);
    const w = want.trim().slice(0, 40);
    const b = benefit.trim().slice(0, 30);
    return `[${r}] wants [${w}] for [${b}]`;
  });
}

/**
 * Remove rationale sections
 */
export function removeRationale(text: string): string {
  return text.replace(/\*\*Rationale:\*\*.*?(?=\n\n|\n###|\n##|$)/gs, "");
}

/**
 * Convert simple tables to inline format
 */
export function compactTables(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  for (const line of lines) {
    if (line.includes("|") && line.trim().startsWith("|")) {
      inTable = true;
      // Skip header separator
      if (/^\|[\s\-:|]+\|$/.test(line)) {
        continue;
      }
      tableRows.push(line);
    } else {
      if (inTable && tableRows.length > 0) {
        // Convert table to compact format (skip header row)
        for (const row of tableRows.slice(1)) {
          const cells = row
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean);
          if (cells.length >= 2) {
            result.push(`  ${cells[0]}: ${cells.slice(1).join(", ")}`);
          }
        }
        tableRows = [];
        inTable = false;
      }
      result.push(line);
    }
  }

  return result.join("\n");
}

/**
 * Remove sections with no content
 */
export function removeEmptySections(text: string): string {
  // Remove sections that are just headers with nothing following
  let result = text.replace(/##+ [^\n]+\n\n(?=##|$)/g, "");
  // Remove multiple blank lines
  result = result.replace(/\n{3,}/g, "\n\n");
  return result;
}

/**
 * Convert bullet lists to comma-separated inline where short
 */
export function compactLists(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let listItems: string[] = [];
  let listIndent: number | null = null;

  for (const line of lines) {
    // Check if line is a list item
    const match = line.match(/^(\s*)-\s+(.+)$/);
    if (match) {
      const indent = match[1].length;
      const item = match[2].trim();

      // Short items can be compacted
      if (item.length < 40 && !item.startsWith("[")) {
        if (listIndent === null) {
          listIndent = indent;
        }
        if (indent === listIndent) {
          listItems.push(item);
          continue;
        }
      }
    }

    // Flush accumulated list items
    if (listItems.length > 0) {
      const indentStr = " ".repeat(listIndent || 0);
      if (listItems.length <= 5) {
        result.push(`${indentStr}- ${listItems.join(", ")}`);
      } else {
        for (const item of listItems) {
          result.push(`${indentStr}- ${item}`);
        }
      }
      listItems = [];
      listIndent = null;
    }

    result.push(line);
  }

  // Handle remaining items
  if (listItems.length > 0) {
    const indentStr = " ".repeat(listIndent || 0);
    if (listItems.length <= 5) {
      result.push(`${indentStr}- ${listItems.join(", ")}`);
    } else {
      for (const item of listItems) {
        result.push(`${indentStr}- ${item}`);
      }
    }
  }

  return result.join("\n");
}

/**
 * Apply all compaction transformations
 */
export function compactSpec(content: string): string {
  let result = content;

  // Apply transformations in order
  result = compactUserStories(result);
  result = compactAcceptanceCriteria(result);
  result = compactRequirements(result);
  result = removeRationale(result);
  result = compactTables(result);
  result = compactLists(result);
  result = removeEmptySections(result);

  // Final cleanup
  return result.trim();
}

/**
 * Rough token estimate (words * 1.3)
 */
export function estimateTokens(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil(words * 1.3);
}
