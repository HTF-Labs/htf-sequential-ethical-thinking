# Jiminy Sequential Thinking MCP Server

A Model Context Protocol (MCP) server for auditable, plural, and stepwise ethical reasoning.  
Jiminy enables any LLM agent or system to *outsource ethical analysis* in a transparent, non-binary, and standards-based way.

---

## 🚦 What is This?

**Jiminy** is a three-phase, auditable ethical reasoning server that implements the [Model Context Protocol (MCP)](https://github.com/modelcontextprotocol/mcp).  
It provides a single tool for any agent to request:
- **Phase 0**: Ethical Issue Detection
- **Phase 1**: Multi-Perspective Analysis
- **Phase 2**: Solutions & Moral Imagination

All steps, revisions, and alternatives are tracked, logged, and structured by design.

---

## 🌳 Why Use Jiminy?

- **Alignment**: Offload difficult ethical questions to a specialist server
- **Plurality**: Always explores alternatives—never just “yes/no”
- **Transparency**: Every step logged (unless disabled) for audit/debug
- **Revision & Branching**: Supports step edits and exploration of alternative lines of thought
- **Separation of Concerns**: Main LLM focuses on generation; Jiminy on *ethical* quality

---

## 🏗️ How Does It Work?

- **Implements one MCP tool:** `jiminy_sequential_thinking`
- **Each call**: A single “thought” step, tagged with metadata:
  - `thought` (text step)
  - `phase` (0, 1, or 2)
  - revision/branching info if present
- **Strict prompt and value hierarchy** underpin every analysis

---

## 🚀 Quick Start

### 1. Install dependencies
```sh
npm install
```

### 2. Run the server
```sh
node index.js
```
(or your entrypoint)

### 3. Connect via MCP
Your orchestrator/LLM should use the Model Context Protocol and call the tool as documented below.

---

## 🛠️ Tool: `jiminy_sequential_thinking`

**Purpose:**  
Structures and audits every step in ethical reasoning, enforcing plural, multi-perspective, and creative analysis.

### Input Schema

| Field               | Type      | Required | Description                                             |
|---------------------|-----------|----------|---------------------------------------------------------|
| `thought`           | string    | yes      | The current reasoning step                              |
| `phase`             | integer   | yes      | 0 = detection, 1 = analysis, 2 = solutions              |
| `thoughtNumber`     | integer   | yes      | Sequence number                                         |
| `totalThoughts`     | integer   | yes      | Estimated total steps needed                            |
| `nextThoughtNeeded` | boolean   | yes      | Whether another step is expected                        |
| `isRevision`        | boolean   | no       | Is this a revision?                                     |
| `revisesThought`    | integer   | no       | Which step is being revised?                            |
| `branchFromThought` | integer   | no       | If branching, which previous step?                      |
| `branchId`          | string    | no       | Branch identifier                                       |
| `needsMoreThoughts` | boolean   | no       | Still needs further steps?                              |

#### Example
```json
{
  "thought": "There is a genuine value conflict between privacy and security obligations.",
  "phase": 0,
  "thoughtNumber": 1,
  "totalThoughts": 4,
  "nextThoughtNeeded": true
}
```

---

## 🔎 Reasoning Structure

Jiminy’s prompt enforces a **three-phase workflow**:

1. **Phase 0 – Detection**
   - Is this a *real* ethical dilemma?
   - If not, stop and explain.
2. **Phase 1 – Multi-Perspective Analysis**
   - Identify values, actors, frameworks, and possible alternatives.
   - Contextualize legally, professionally, organizationally.
3. **Phase 2 – Solutions & Moral Imagination**
   - Present all plausible solutions (not just A/B).
   - Highlight trade-offs, regrets, “moral remainders,” and creative possibilities.

**Always pluralist and creative. Never “just pick a side.”**

---

## 🏛️ Value Hierarchy

Jiminy is anchored in a strict value hierarchy (always included in each system prompt):

1. **Dignity & Integrity of the Person** (non-derogable): right to life, integrity, prohibition of torture/slavery/inhuman treatment.
2. **Freedoms & Privacy**: autonomy, consent, data, speech, thought, association.
3. **Equality & Non-discrimination**: equal protection, measures for vulnerable.
4. **Justice & Rule of Law**: fair trial, effective remedy, proportionality.
5. **Solidarity & Social Rights**: health, social/environmental/consumer protection.
6. **Citizens’ Rights & Good Administration**: democracy, transparency, redress.

> **Absolute red lines**: Dignity, life, integrity, and bans on torture/slavery/inhuman treatment—never to be compromised.

*(See code for full hierarchy & prompt.)*

---

## 🖥️ Logging

- Every step is printed (stderr) in a colorized box per phase.
- **Disable logging** with:
  ```
  DISABLE_THOUGHT_LOGGING=true
  ```

---

## 🔄 Revision & Branching

- Support for iterative improvement, revision, and parallel “branches” of reasoning.
- Enables audit, rollback, and plural exploration of dilemmas.

---

## 🧑‍💻 For Developers

- **Node.js** (TypeScript), built on [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/mcp)
- Plug-and-play with any MCP-compatible LLM/agent
- Value hierarchy, prompt, phases—all extensible

---

## 📜 License

MIT

---

## 📚 References

- EU Charter of Fundamental Rights
- Universal Declaration of Human Rights
- European Declaration on Digital Rights and Principles

---

