/**
 * Structured checkpoint parsing for extracting actionable info from checkpoint.md
 */

export interface ParsedCheckpoint {
  date: string | null;
  summary: string | null;
  accomplished: string[];
  blockers: string[];
  nextSteps: string[];
  rawContent: string;
}

/**
 * Parse checkpoint markdown content into structured data.
 * Extracts date, summary, accomplished items, blockers, and next steps.
 */
export function parseCheckpoint(content: string): ParsedCheckpoint {
  const result: ParsedCheckpoint = {
    date: null,
    summary: null,
    accomplished: [],
    blockers: [],
    nextSteps: [],
    rawContent: content,
  };

  if (!content.trim()) {
    return result;
  }

  const lines = content.split("\n");

  // Extract date (first date pattern found)
  const dateMatch = content.match(/\d{4}-\d{2}-\d{2}/);
  if (dateMatch) {
    result.date = dateMatch[0];
  }

  // Parse line by line
  let currentSection: "none" | "accomplished" | "blockers" | "next" = "none";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip date-only lines
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) continue;

    // Detect section headers
    const lowerLine = trimmed.toLowerCase();

    if (
      lowerLine.includes("accomplished") ||
      lowerLine.includes("completed") ||
      lowerLine.includes("done") ||
      lowerLine.includes("finished")
    ) {
      currentSection = "accomplished";
      continue;
    }

    if (
      lowerLine.includes("blocker") ||
      lowerLine.includes("blocked") ||
      lowerLine.includes("stuck") ||
      lowerLine.includes("waiting on") ||
      lowerLine.includes("issue")
    ) {
      currentSection = "blockers";
      continue;
    }

    if (
      lowerLine.includes("next step") ||
      lowerLine.includes("next:") ||
      lowerLine.includes("todo") ||
      lowerLine.includes("remaining") ||
      lowerLine.includes("upcoming")
    ) {
      currentSection = "next";
      continue;
    }

    // Check for completed items (with checkmarks)
    if (/^-?\s*\[x\]/.test(trimmed) || trimmed.startsWith("✓") || trimmed.startsWith("✅")) {
      const text = trimmed.replace(/^-?\s*\[x\]\s*/, "").replace(/^[✓✅]\s*/, "");
      if (text) {
        result.accomplished.push(text);
      }
      continue;
    }

    // Check for list items
    if (/^[-*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "");

      // Categorize based on current section or keywords
      if (currentSection === "accomplished") {
        result.accomplished.push(text);
      } else if (currentSection === "blockers") {
        result.blockers.push(text);
      } else if (currentSection === "next") {
        result.nextSteps.push(text);
      } else {
        // Try to categorize by keywords in the text itself
        const textLower = text.toLowerCase();
        if (
          textLower.includes("blocked") ||
          textLower.includes("waiting") ||
          textLower.includes("stuck")
        ) {
          result.blockers.push(text);
        } else if (
          textLower.includes("next") ||
          textLower.includes("todo") ||
          textLower.includes("will ")
        ) {
          result.nextSteps.push(text);
        }
        // Otherwise skip - ambiguous items
      }
      continue;
    }

    // First non-list, non-header line becomes summary
    if (!result.summary && !trimmed.startsWith("#") && !trimmed.startsWith("---")) {
      result.summary = trimmed;
    }
  }

  return result;
}
