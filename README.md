# Sequential Ethical Thinking MCP Server

An experimental MCP server that provides a tool for structured, auditable ethical reasoning—step by step—using multiple moral frameworks.  
Inspired by Anthropic's sequential thinking server, this version supports deontological, consequentialist, virtue, care, pluralistic, and meta-level (“guardian”) reasoning for deep, transparent moral deliberation.

## Features

- **Pluralistic moral reasoning:**  
  - ⚖️ Deontological (duty-based): Is the action right in itself?
  - 📈 Consequentialist: What are the likely outcomes?
  - 🌟 Virtue: What would a person of exemplary moral character do?
  - 🤝 Care: Are relational needs and vulnerabilities addressed?
  - 🌐 Pluralistic: Integration/critique of several frameworks
  - 🛡️ Guardian/Clarification: Meta-level guidance, prompt cycles, or clarification loops
- Track revisions and branches in ethical reasoning
- Log and review all reasoning steps for transparency
- Suggest a final moral judgment based on pluralist analysis
- Flexible and interactive—suitable for iterative or “Ethical Guardian” workflows

## Tool

### `sequentialethicalthinking`

Facilitates detailed, stepwise, pluralistic ethical reasoning.

**Inputs:**

- `thought` (string): The ethical reasoning step
- `ethicalPhase` (string):  
  `"deontological"`, `"consequentialist"`, `"virtue"`, `"care"`, `"pluralistic"`, `"guardian"`, `"clarification"`, or `"custom"`
- `nextThoughtNeeded` (boolean): Whether another reasoning step is needed
- `thoughtNumber` (integer): Current step number
- `totalThoughts` (integer): Estimated total steps
- `isRevision` (boolean, optional): Is this a revision of a previous thought?
- `revisesThought` (integer, optional): Which thought is being revised
- `branchFromThought` (integer, optional): Branching from which step
- `branchId` (string, optional): Branch identifier
- `needsMoreThoughts` (boolean, optional): Whether further analysis is needed
- `promptForNext` (string, optional): Suggestion or instruction for the next reasoning step (e.g. for Ethical Guardian meta-prompts)

**Example input:**
```json
{
  "thought": "From a consequentialist viewpoint, prioritizing the scientist could maximize total lives saved.",
  "ethicalPhase": "consequentialist",
  "nextThoughtNeeded": true,
  "thoughtNumber": 2,
  "totalThoughts": 4,
  "promptForNext": "Now consider the virtue ethics perspective."
}


## Configuration

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

#### npx

```json
{
  "mcpServers": {
    "sequentialethicalthinking": {
      "command": "npx",
      "args": [
        "-y",
        "@paulhb7/mcp-sequential-ethical-thinking"
      ]
    }
  }
}
```

#### docker

```json
{
  "mcpServers": {
    "sequentialethicalthinking": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "mcp/sequentialethicalthinking"
      ]
    }
  }
}
```

### Usage with VS Code

You can also configure this server in VS Code.

For NPX installation:

```json
{
  "mcp": {
    "servers": {
      "sequentialethicalthinking": {
        "command": "npx",
        "args": [
          "-y",
          "@paulhb7/mcp-sequential-ethical-thinking"
        ]
      }
    }
  }
}
```

For Docker installation:

```json
{
  "mcp": {
    "servers": {
      "sequentialethicalthinking": {
        "command": "docker",
        "args": [
          "run",
          "--rm",
          "-i",
          "mcp/sequentialethicalthinking"
        ]
      }
    }
  }
}
```

## Building

To build the Docker image:

```bash
docker build -t mcp/sequentialethicalthinking -f Dockerfile .
```

## License

This MCP server is licensed under the MIT License. This is an experimental implementation based on the original sequential thinking server by Anthropic.
