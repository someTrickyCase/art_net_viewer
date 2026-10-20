# art-net-viewer

A terminal app that shows the Art-Net traffic on the networks this
machine is connected to. Built for real theatre work (grandMA2 shows).
Runs on Windows 11.

## Hard rules

- **Listen only.** The app never sends packets to the network. No
  `socket.send()`, no ArtPoll, no ArtAddress. Discovery is passive: we
  only read ArtPollReply packets that other devices send.
- **Never commit to `main`.** Work on a branch; changes reach `main`
  only through a pull request.

## Stack

- Node.js >= 24, TypeScript (strictest settings), ESM (`"type": "module"`)
- UI: Ink (React for the terminal)
- Run TS/TSX directly with `tsx` (no build step). `tsc` only type-checks.
- Tests: built-in `node:test` + `node:assert/strict`;
  `ink-testing-library` for UI components
- Lint: ESLint (typescript-eslint strict + stylistic type-checked,
  custom local rules). Format: Prettier.

## Commands

| Command               | What it does                            |
| --------------------- | --------------------------------------- |
| `npm start`           | Run the app                             |
| `npm run dev`         | Run and restart on file changes         |
| `npm test`            | Run all tests                           |
| `npm run test:update` | Run tests and rewrite UI snapshots      |
| `npm run typecheck`   | Type-check with `tsc`                   |
| `npm run lint`        | ESLint, zero warnings allowed           |
| `npm run format`      | Format all files with Prettier          |
| `npm run check`       | typecheck + lint + format check + tests |

`npm run check` must pass before every commit.

## Architecture

Layers, each with one job. Lower layers never import from higher ones.

```
src/
  protocol/  Pure parsing: Buffer -> typed objects. No I/O, no UI.
  net/       UDP socket on port 6454; hands raw packets to the store.
  state/     Store: latest frame per universe + stats (fps, source,
             last seen, sequence gaps). Receive fast.
  ui/        Ink components. Read the store on a timer. Draw slowly.
  cli.tsx    Entry point: wires the layers together.
test/        Mirrors src/ one to one.
scratch/     Local experiments. Ignored by Git, ESLint and Prettier.
```

Design rule: **receive fast, draw slowly.** The socket callback only
stores data; the UI redraws on a timer (about 10-20 times per second),
never once per packet.

## Code conventions

Enforced by tools (see `eslint.config.js`, `tsconfig.json`):

- Max line width 80.
- Only printable ASCII in code files. Build non-ASCII UI characters from
  code points: `String.fromCodePoint(0x2588)`. Do NOT write `\u` escapes
  in strings: Prettier turns them into the real characters.
- No comments in code files, except one license note at the very top.
  Code explains itself with names, small functions and tests. No
  `eslint-disable` comments (inline config is turned off).
- No magic numbers: put protocol offsets and sizes in named constants
  (`const OPCODE_OFFSET = 8`). Tests are allowed to use literals.
- Never make the linter, the type checker or Prettier less strict.
  If a rule blocks you, change the code, not the rule.

Not enforced, but expected:

- Named exports only. Relative imports use the `.ts` / `.tsx`
  extension.
- `import type` for type-only imports.
- Small pure functions in `protocol/`. Side effects live in `net/`
  and `cli.tsx`.

## Tests

- Every module in `src/` has a test file at the same path in `test/`:
  `src/protocol/header.ts` -> `test/protocol/header.test.ts`.
- Test layer by layer: protocol tests build packets with `Buffer`,
  state tests feed parsed objects, UI tests render components.
- Real packets captured from MA2 can go into `test/fixtures/`.
- Shared test helpers (e.g. packet builders) live in `test/support/`.
- Every UI component gets a screenshot test: `t.assert.snapshot()` on
  the rendered frame. Snapshots are saved next to the test as
  `*.test.tsx.snapshot` and committed. After a deliberate UI change,
  run `npm run test:update` and review the snapshot diff before
  committing. Never update snapshots just to make a failing test pass.

## Art-Net facts (verified on MA2 onPC 3.9)

- UDP port 6454. Header: `Art-Net\0` (8 bytes) + OpCode (little-endian).
- ArtDmx: sequence at byte 12, SubUni at 14, Net at 15, Length at
  16-17 (big-endian), DMX data from byte 18.
- Port-Address = Net * 256 + SubNet * 16 + Universe (15 bits).
- MA2 Art-Net setup: "Local start" / "Amount" pick MA universes and
  are not in the packet. MA2 "Network" is 1-based (Network 1 -> Net 0).
  Sub-Net and Universe are sent as set.
- MA2 sends on change plus a slow keep-alive (about 1 packet/s per
  universe when nothing changes). Each universe has its own sequence
  counter.
