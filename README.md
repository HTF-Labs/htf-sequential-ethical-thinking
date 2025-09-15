# Sequential Ethical Thinking MCP Server

An experimental MCP server for **structured, auditable ethical reasoning—step by step—using multiple moral frameworks and a human rights-based value hierarchy**.

Inspired by Anthropic's sequential thinking server, this implementation supports **deontological, consequentialist, virtue, care, pluralistic, and meta-level (“guardian”) reasoning** for deep, transparent, and non-binary moral deliberation.

---

## Features

- **Pluralistic moral reasoning:**
  - ⚖️ **Deontological** (duty-based): Is the action right in itself?
  - 📈 **Consequentialist**: What are the likely outcomes?
  - 🌟 **Virtue**: What would a person of exemplary moral character do?
  - 🤝 **Care**: Are relational needs and vulnerabilities addressed?
  - 🌐 **Pluralistic**: Integrate and critique several frameworks.
  - 🛡️ **Guardian/Clarification**: Meta-level guidance, prompt cycles, or clarification loops.
- **Explicit value hierarchy and red lines** based on the EU Charter of Fundamental Rights and Universal Declaration of Human Rights (see below).
- **Track revisions and branches** in ethical reasoning.
- **Log and review all reasoning steps** for transparency and auditability.
- **Suggest a final moral judgment** based on pluralist analysis.
- **Flexible and interactive**—suitable for iterative or “Ethical Guardian” workflows.

---

## Jiminy Value Hierarchy (Default Foundation)

All ethical analysis is grounded in the following prioritized values:

1. **Dignity & integrity of the person** (non-derogable): right to life, physical and mental integrity, absolute prohibition of torture, slavery, inhuman or degrading treatment.
2. **Freedoms & privacy**: autonomy, consent, data protection, and fundamental freedoms (expression, thought, association, etc.).
3. **Equality & non-discrimination**: equal protection, active measures for children, the elderly, and persons with disabilities.
4. **Justice & rule of law**: fair trial, effective remedy, presumption of innocence, proportionality of penalties.
5. **Solidarity & social rights**: health, environmental protection, social protection, and consumer rights.
6. **Citizens’ rights & good administration**: democratic participation, transparency, access to information and redress.

**Absolute red lines:** Human dignity, life, and physical/mental integrity; absolute bans on torture, slavery, and inhuman or degrading treatment.  
These cannot be compromised under any circumstances.

> _Based on the EU Charter of Fundamental Rights, Universal Declaration of Human Rights, and European Digital Principles. The most protective interpretation of rights always applies._

---

## Tool

### `sequentialethicalthinking`

Facilitates detailed, stepwise, pluralistic ethical reasoning.

#### Inputs

- `thought` (**string**): The ethical reasoning step.
- `ethicalPhase` (**string**):  
  `"deontological"`, `"consequentialist"`, `"virtue"`, `"care"`, `"pluralistic"`, `"guardian"`, `"clarification"`, or `"custom"`.
- `nextThoughtNeeded` (**boolean**): Whether another reasoning step is needed.
- `thoughtNumber` (**integer**): Current step number.
- `totalThoughts` (**integer**): Estimated total steps.
- `isRevision` (**boolean, optional**): Is this a revision of a previous thought?
- `revisesThought` (**integer, optional**): Which thought is being revised.
- `branchFromThought` (**integer, optional**): Branching from which step.
- `branchId` (**string, optional**): Branch identifier.
- `needsMoreThoughts` (**boolean, optional**): Whether further analysis is needed.
- `promptForNext` (**string, optional**): Suggestion or instruction for the next reasoning step (e.g., for Ethical Guardian meta-prompts).
