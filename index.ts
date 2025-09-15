#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import chalk from 'chalk';

type JiminyPhase = 0 | 1 | 2;

interface ThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  phase: JiminyPhase;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
}

class JiminySequentialThinkingServer {
  private thoughtHistory: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};
  private disableThoughtLogging: boolean;

  constructor() {
    this.disableThoughtLogging = (process.env.DISABLE_THOUGHT_LOGGING || "").toLowerCase() === "true";
  }

  private validateThoughtData(input: unknown): ThoughtData {
    const data = input as Record<string, unknown>;

    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error('Invalid thought: must be a string');
    }
    if (typeof data.thoughtNumber !== 'number') {
      throw new Error('Invalid thoughtNumber: must be a number');
    }
    if (typeof data.totalThoughts !== 'number') {
      throw new Error('Invalid totalThoughts: must be a number');
    }
    if (typeof data.nextThoughtNeeded !== 'boolean') {
      throw new Error('Invalid nextThoughtNeeded: must be a boolean');
    }
    if (typeof data.phase !== 'number' || ![0, 1, 2].includes(data.phase as number)) {
      throw new Error('Invalid phase: must be 0, 1 or 2');
    }

    return {
      thought: data.thought,
      thoughtNumber: data.thoughtNumber,
      totalThoughts: data.totalThoughts,
      nextThoughtNeeded: data.nextThoughtNeeded,
      phase: data.phase as JiminyPhase,
      isRevision: data.isRevision as boolean | undefined,
      revisesThought: data.revisesThought as number | undefined,
      branchFromThought: data.branchFromThought as number | undefined,
      branchId: data.branchId as string | undefined,
      needsMoreThoughts: data.needsMoreThoughts as boolean | undefined,
    };
  }

  private phaseLabel(phase: JiminyPhase): string {
    switch (phase) {
      case 0:
        return chalk.gray("PHASE 0 – Ethical Issue Detection");
      case 1:
        return chalk.blue("PHASE 1 – Multi-Perspective Analysis");
      case 2:
        return chalk.green("PHASE 2 – Solutions & Moral Imagination");
      default:
        return chalk.white("PHASE ?");
    }
  }

  private formatThought(thoughtData: ThoughtData): string {
    const { thoughtNumber, totalThoughts, thought, isRevision, revisesThought, branchFromThought, branchId, phase } = thoughtData;

    let prefix = '';
    let context = '';

    if (isRevision) {
      prefix = chalk.yellow('🔄 Revision');
      context = ` (revising thought ${revisesThought})`;
    } else if (branchFromThought) {
      prefix = chalk.magenta('🌿 Branch');
      context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
    } else {
      prefix = this.phaseLabel(phase);
      context = '';
    }

    const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
    const border = '─'.repeat(Math.max(header.length, thought.length) + 4);

    return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
└${border}┘`;
  }

  public processThought(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedInput = this.validateThoughtData(input);

      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
        validatedInput.totalThoughts = validatedInput.thoughtNumber;
      }

      this.thoughtHistory.push(validatedInput);

      if (validatedInput.branchFromThought && validatedInput.branchId) {
        if (!this.branches[validatedInput.branchId]) {
          this.branches[validatedInput.branchId] = [];
        }
        this.branches[validatedInput.branchId].push(validatedInput);
      }

      if (!this.disableThoughtLogging) {
        const formattedThought = this.formatThought(validatedInput);
        console.error(formattedThought);
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            thoughtNumber: validatedInput.thoughtNumber,
            totalThoughts: validatedInput.totalThoughts,
            nextThoughtNeeded: validatedInput.nextThoughtNeeded,
            phase: validatedInput.phase,
            branches: Object.keys(this.branches),
            thoughtHistoryLength: this.thoughtHistory.length
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}

// --- JIMINY SYSTEM PROMPT (ENGLISH) ---
const JIMINY_SYSTEM_DESCRIPTION = `
Jiminy System Prompt (3 Phases)
Always structure your analysis and “thoughts” into the three Jiminy phases:
──────────────────────────────
PHASE 0: Detection of an Ethical Issue
- Check if a genuine ethical dilemma or value tension exists.
- If the scenario is only apparent, strictly binary, or lacks real moral stakes (e.g., fake dilemmas, disguised preferences, exaggerated consequences, artificial urgency), explain why and stop the analysis (next_thought_needed = false).
- If the issue is not ethical, explain and finish.

PHASE 1: Multi-perspective Analysis
- If a true ethical issue exists, identify all values, actors, and ethical frameworks in tension (deontological, consequentialist, care, virtue, etc.).
- Explicitly contextualize (organizational, legal, professional, cultural factors).
- Always identify and present alternative solutions (“third ways” or non-binary approaches).
- List uncertainties and recognize possible plural priorities.

PHASE 2: Solutions, Moral Imagination & Plurality
- Explore and compare all realistic solutions—not just A/B (creative compromise, hybrid, nudge, alternative process, etc.).
- Explicitly highlight “moral remainders” (regrets, unresolved trade-offs, need for repair or compensation).
- Present your solution(s) with justified arguments, uncertainty levels, and ethical limitations.
- Only finish when all perspectives and alternatives have been explored.
──────────────────────────────
Mark each “thought” with its phase (0, 1, or 2).
Always favor plural, creative, and nuanced analysis. Never give only a binary answer.
`;

// --------------- TOOL DEFINITION ----------------
const JIMINY_SEQUENTIAL_THINKING_TOOL: Tool = {
  name: "jiminy_sequential_thinking",
  description: JIMINY_SYSTEM_DESCRIPTION,
  inputSchema: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "Your current step of ethical reasoning, following the Jiminy phase structure"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether another thought step is needed"
      },
      thoughtNumber: {
        type: "integer",
        description: "Current thought number (1, 2, 3, ...)",
        minimum: 1
      },
      totalThoughts: {
        type: "integer",
        description: "Estimated total thoughts needed (can increase or decrease)",
        minimum: 1
      },
      phase: {
        type: "integer",
        enum: [0, 1, 2],
        description: "Jiminy phase (0: detection, 1: analysis, 2: solutions)"
      },
      isRevision: {
        type: "boolean",
        description: "Whether this revises a previous thought"
      },
      revisesThought: {
        type: "integer",
        description: "Which thought is being reconsidered",
        minimum: 1
      },
      branchFromThought: {
        type: "integer",
        description: "Branching point thought number",
        minimum: 1
      },
      branchId: {
        type: "string",
        description: "Branch identifier"
      },
      needsMoreThoughts: {
        type: "boolean",
        description: "If more thoughts are needed"
      }
    },
    required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts", "phase"]
  }
};

const server = new Server(
  {
    name: "jiminy-sequential-thinking-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const jiminyThinkingServer = new JiminySequentialThinkingServer();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [JIMINY_SEQUENTIAL_THINKING_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "jiminy_sequential_thinking") {
    return jiminyThinkingServer.processThought(request.params.arguments);
  }

  return {
    content: [{
      type: "text",
      text: `Unknown tool: ${request.params.name}`
    }],
    isError: true
  };
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Jiminy Sequential Thinking MCP Server running on stdio (3-phase ethical reasoning, non-binary, pluralist, with alternatives)");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
