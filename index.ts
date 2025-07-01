#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import chalk from "chalk";

type EthicalPhase =
  | "deontological"
  | "consequentialist"
  | "virtue"
  | "care"
  | "pluralistic"
  | "guardian"
  | "clarification"
  | "custom";

interface ThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  ethicalPhase: EthicalPhase;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  nextThoughtNeeded: boolean;
  promptForNext?: string; // For Ethical Guardian cycle
}

class SequentialEthicalThinkingServer {
  private thoughtHistory: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};

  private validateThoughtData(input: unknown): ThoughtData {
    const data = input as Record<string, unknown>;

    // Basic validation + default fallback
    if (!data.thought || typeof data.thought !== "string") {
      throw new Error("Invalid thought: must be a string");
    }
    if (typeof data.thoughtNumber !== "number") {
      throw new Error("Invalid thoughtNumber: must be a number");
    }
    if (typeof data.totalThoughts !== "number") {
      throw new Error("Invalid totalThoughts: must be a number");
    }
    if (typeof data.nextThoughtNeeded !== "boolean") {
      throw new Error("Invalid nextThoughtNeeded: must be a boolean");
    }
    // Accept any phase in the EthicalPhase union
    const validPhases: EthicalPhase[] = [
      "deontological",
      "consequentialist",
      "virtue",
      "care",
      "pluralistic",
      "guardian",
      "clarification",
      "custom"
    ];
    if (!validPhases.includes(data.ethicalPhase as EthicalPhase)) {
      throw new Error(
        `Invalid ethicalPhase: must be one of ${validPhases.join(", ")}`
      );
    }

    return {
      thought: data.thought,
      thoughtNumber: data.thoughtNumber,
      totalThoughts: data.totalThoughts,
      nextThoughtNeeded: data.nextThoughtNeeded,
      ethicalPhase: data.ethicalPhase as EthicalPhase,
      isRevision: data.isRevision as boolean | undefined,
      revisesThought: data.revisesThought as number | undefined,
      branchFromThought: data.branchFromThought as number | undefined,
      branchId: data.branchId as string | undefined,
      needsMoreThoughts: data.needsMoreThoughts as boolean | undefined,
      promptForNext: data.promptForNext as string | undefined,
    };
  }

  private formatThought(thoughtData: ThoughtData): string {
    const {
      thoughtNumber,
      totalThoughts,
      thought,
      isRevision,
      revisesThought,
      branchFromThought,
      branchId,
      ethicalPhase,
      promptForNext,
    } = thoughtData;

    let prefix = "";
    let context = "";

    if (isRevision) {
      prefix = chalk.yellow("🔄 Revision");
      context = ` (revising thought ${revisesThought})`;
    } else if (branchFromThought) {
      prefix = chalk.green("🌿 Branch");
      context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
    } else {
      // New: handle all phases, colored
      switch (ethicalPhase) {
        case "deontological":
          prefix = chalk.magenta("⚖️ Deontological");
          break;
        case "consequentialist":
          prefix = chalk.cyan("📊 Consequentialist");
          break;
        case "virtue":
          prefix = chalk.yellowBright("🌟 Virtue Ethics");
          break;
        case "care":
          prefix = chalk.redBright("🤝 Care Ethics");
          break;
        case "pluralistic":
          prefix = chalk.blueBright("🌐 Pluralistic");
          break;
        case "guardian":
          prefix = chalk.whiteBright("🛡️ Guardian");
          break;
        case "clarification":
          prefix = chalk.gray("❓ Clarification");
          break;
        default:
          prefix = chalk.white("🔸 Custom");
      }
    }

    const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
    const border = "─".repeat(Math.max(header.length, thought.length) + 4);

    return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
${
  promptForNext
    ? `├${border}┤\n│ Prompt for next: ${promptForNext.padEnd(
        border.length - 18
      )} │`
    : ""
}
└${border}┘`;
  }

  private evaluateJudgment(): string | null {
    // Here you could expand with more frameworks
    const phases = [
      "deontological",
      "consequentialist",
      "virtue",
      "care",
      "pluralistic",
    ] as EthicalPhase[];
    const relevant = this.thoughtHistory.filter((t) =>
      phases.includes(t.ethicalPhase)
    );
    if (relevant.length < 2) return null;

    // Simple aggregation: all frameworks must agree for “acceptable”
    const allAcceptable = relevant.every((t) =>
      t.thought.toLowerCase().includes("acceptable")
    );
    const anyUnacceptable = relevant.some((t) =>
      t.thought.toLowerCase().includes("unacceptable")
    );

    if (allAcceptable) {
      return "✅ Final ethical judgment: Action is acceptable under all frameworks considered.";
    }
    if (anyUnacceptable) {
      return "❌ Final ethical judgment: Action is ethically problematic under at least one framework.";
    }
    return "⚠️ Ethical judgment: Mixed or ambiguous, further analysis recommended.";
  }

  public processThought(input: unknown): {
    content: Array<{ type: string; text: string }>;
    isError?: boolean;
  } {
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

      const formattedThought = this.formatThought(validatedInput);
      console.error(formattedThought);

      const judgment = this.evaluateJudgment();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                thoughtNumber: validatedInput.thoughtNumber,
                totalThoughts: validatedInput.totalThoughts,
                nextThoughtNeeded: validatedInput.nextThoughtNeeded,
                branches: Object.keys(this.branches),
                ethicalPhase: validatedInput.ethicalPhase,
                promptForNext: validatedInput.promptForNext,
                judgment,
                thoughtHistoryLength: this.thoughtHistory.length,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: error instanceof Error ? error.message : String(error),
                status: "failed",
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  }
}

const SEQUENTIAL_ETHICAL_THINKING_TOOL: Tool = {
  name: "sequentialethicalthinking",
  description: `A structured tool for ethical reasoning, supporting sequential, branching, and pluralistic moral analysis.
Phases supported:
- deontological: Is the action right in itself?
- consequentialist: What are the likely outcomes?
- virtue: What would a person of exemplary character do?
- care: Are relational needs and vulnerabilities addressed?
- pluralistic: Integration/critique of several frameworks
- guardian: For meta-level critique, prompts, or clarification cycles

Use for evaluating dilemmas, conflicting values, or as an ethical “prompt engine” to guide further analysis.

Each step logs context; a final judgment is suggested if possible.`,
  inputSchema: {
    type: "object",
    properties: {
      thought: { type: "string", description: "Ethical reasoning step" },
      nextThoughtNeeded: { type: "boolean", description: "Is further ethical analysis needed?" },
      thoughtNumber: { type: "integer", description: "Current step number", minimum: 1 },
      totalThoughts: { type: "integer", description: "Estimated total steps", minimum: 1 },
      isRevision: { type: "boolean", description: "Does this revise a previous step?" },
      revisesThought: { type: "integer", description: "Which step is revised?", minimum: 1 },
      branchFromThought: { type: "integer", description: "Branching from step", minimum: 1 },
      branchId: { type: "string", description: "Branch identifier" },
      needsMoreThoughts: { type: "boolean", description: "Do we need more thinking?" },
      ethicalPhase: {
        type: "string",
        enum: [
          "deontological",
          "consequentialist",
          "virtue",
          "care",
          "pluralistic",
          "guardian",
          "clarification",
          "custom"
        ],
        description: "Type of ethical reasoning used in this step"
      },
      promptForNext: { type: "string", description: "Prompt/instruction for the next step, for meta-level guidance (optional)" },
    },
    required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts", "ethicalPhase"]
  }
};

const server = new Server(
  {
    name: "sequential-ethical-thinking-server",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const ethicalThinkingServer = new SequentialEthicalThinkingServer();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [SEQUENTIAL_ETHICAL_THINKING_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "sequentialethicalthinking") {
    return ethicalThinkingServer.processThought(request.params.arguments);
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${request.params.name}`,
      },
    ],
    isError: true,
  };
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sequential Ethical Thinking MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
