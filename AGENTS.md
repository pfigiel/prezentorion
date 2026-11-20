# Coding standards

Rules for anyone writing code in this repository, human or agent. Every coding agent loads this file
automatically; `CLAUDE.md` is a symlink to it. The repository is one pnpm workspace run through
turbo: `apps/*` are the applications, `packages/*` are the libraries and shared configuration they
build on.

Rules go here only when a linter cannot enforce them. Anything mechanically checkable belongs in
`@prezentorion/eslint-config`, `.prettierrc.json`, `.stylelintrc.json` or `packages/tsconfig`. How
the workspace is run — commands, git hooks — is in [README.md](README.md).

This project has no automated tests, and none are written. Do not add a test, a test runner, a test
script or a test-only dependency. A change is verified through types, lint, the build and the
running app.

## Writing code

### Comments

Default to code that explains itself. Reach for a comment only when the code cannot be made to say
it:

- It is genuinely hard to follow and cannot be simplified.
- It is a workaround, and the reader needs to know what forced it.
- The _why_ is invisible — an external constraint, a spec, a deliberate choice against the obvious
  alternative.

Fitting one of those makes a comment eligible, not justified. To earn it, name the reader who gets
something wrong without it and what they wrongly conclude. If you cannot name them, delete it. Doubt
resolves to deletion.

Otherwise rename, extract, or split. A comment restating the code doubles what a reader must check,
and goes stale the first time the code changes without it. Doc comments meet the same bar: JSDoc on
an export earns its place by saying what the name and signature do not.

Say it in one line. A comment that needs a paragraph is usually explaining a rule, which belongs in
this file, or covering for code that should change instead; only genuinely tangled context earns
more than a line.

### Suppressions

Do not silence a warning or an error — fix what the tool is reporting. A suppression is a last
resort, and should be a rare one.

For TS errors, where one is genuinely warranted, reach for `@ts-expect-error`: it fails once the
underlying error is gone, so a suppression cannot outlive its cause. Give it, and every
`eslint-disable`, a one-line reason naming what forced it. Lint requires that reason and rejects a
directive that suppresses nothing; neither check can tell whether the suppression earns its place.

Generated files are the exception. Their suppressions belong to the generator and are rewritten on
the next build, so exclude the file from the tool rather than editing what it wrote.

### YAGNI

Build what a current requirement asks for, and nothing beyond it. A guess about what comes next is
usually wrong, and the code written for it is maintained, reviewed and read from the day it lands
until someone deletes it.

- No prop, parameter or option without a call site passing it.
- No abstraction over a single implementation. The second case is what shows where the seam belongs.
- No configuration for what does not exist: an ignore entry for a directory nothing writes, a lint
  rule for a framework not installed.
- No placeholders — empty modules, flags guarding unbuilt features, exports with no importer.

Delete code nothing references, in the change that stranded it. Two cases, and they differ:

- Nothing references it at all — delete it, with its styles.
- Only its own package references it — keep the code and take it out of the barrel. A public export
  is a promise to keep something working.

"We might need it later" is not a reason to keep it, or to write it, because git still has it. The
rule bends only where a later change could not retrofit it cheaply, such as a stored data shape; say
which.

### Visual checks

Looking at the running app is the human's job. An agent does not open a browser to see whether a
change renders, unless it was asked to, and reports what it could verify — types, lint, the build,
the compiled CSS — then says what to look at and what might be wrong with it.

### Language

Code, comments, commit messages and documentation are English. The product itself is Polish.

Text a user reads comes from a message catalog, never from a literal in a component:
`t('home.title')`, not `'Witaj, świecie'`. Polish is the only locale for now; the catalogs exist so
another language is a set of files rather than a rewrite. Each domain holds its own messages in
`<domain>/locales/<locale>.json`, and `src/locales/catalogs.ts` names the namespace each file lands
under and merges them into one catalog per locale.

A value a user reads — a date, an amount, a number — goes through a formatting helper rather than
`toLocaleString` at the call site. Formatting is Polish, and the helper is the one place a locale
would enter if that changes.

## Dependencies

### Package audits

`pnpm deps:audit` fails on a high or critical advisory, and clearing it means removing the
vulnerability rather than the report. Take the first of these that applies:

- **Upgrade** to the release carrying the fix, pinning a transitive package through `overrides` in
  [`pnpm-workspace.yaml`](pnpm-workspace.yaml) where the one above it lags.
- **Patch** with `pnpm patch` where the fix exists upstream but no release reaches our tree.
- **Waive** only when neither works: read the advisory, decide whether what it describes can happen
  here, and add that one GHSA to `auditConfig.ignoreGhsas`.

A waiver names a single GHSA and carries a comment saying that no fix is published and what makes
the risk acceptable here. Never raise `--audit-level` or ignore a package wholesale — both hide the
next advisory as well — and delete the entry with the upgrade that fixes it.

## Structure

### Barrels

A folder that encapsulates something re-exports it from an `index.ts`, so the import path names the
folder and stops: `../Alert`, never `../Alert/Alert`. Lint rejects the repeated segment.

That is the only barrel worth having. A package's public surface is one more, and beyond those two a
barrel is an index of everything below it — it hides where things live and drags unrelated modules
along behind one import.

Re-export by name, never with `export *`. A file's exports rarely have one audience: some are there
for a neighbour in the same folder, and forwarding whatever a module happens to export hands those
to everyone. Naming them is where the line between the two gets drawn.

### Shared code

Logic used by more than one package moves into a package of its own under `packages/`; logic one
package uses stays there until a second one needs it. Each piece gets its own folder and a barrel.

### App structure

Every app is organised by domain, not by page or by layer. Everything a feature is made of — its
screens, its components, its data access, its rules — lives in a top-level domain folder, and each
domain decides how far it divides, in the order below.

In `apps/web`, `src/routes` holds routing and nothing else: a path, its params handed to a screen,
and whatever must be loaded before that screen renders. So a route module imports from a domain, and
nothing imports from `src/routes`. Code co-located under the route that happens to show it is tied
to today's URL, and a domain reached from two places ends up split across both.

The tree divides by domain first and by kind of code last, and never the other way round. A domain
splits into sub-domains where it needs to; below the last of them come the technical folders —
`api`, `components`, `hooks`, `contexts`, `constants`, `utils`, `locales`. A technical folder never
holds a domain folder, and the two never sit side by side: `projects/rooms` beside `projects/api`
and `projects/components` makes one segment of the path name part of the product and its neighbour a
kind of code, so the path stops saying which it is. A concept smaller than a sub-domain spreads
across the technical folders by name — `projects/hooks/use-room.ts`, `projects/constants/rooms.ts`.
One that outgrows that becomes a sub-domain, and then everything at its level does too: the parent's
technical folders move down into sub-domains of their own.

`src/ui` is the component library the app would otherwise import from a package: Mantine wrappers in
`components`, the tokens and the Mantine theme in `theme`, and the global stylesheets. It knows
nothing about the product — no catalog, no API — so it could move out into a package unchanged.

### File names

A module with one export is named after it: `flatten-tokens.ts` exports `flattenTokens`, `Text.tsx`
exports `Text`. The case follows the export — PascalCase for a component, kebab-case for everything
else — so a reader searching for a name finds the file without opening any.

A module that exports several related things is named for what they have in common, as `tokens.ts`
is, rather than after whichever export is largest.

### Mapper names

A function that turns its arguments into something is named after what it returns, followed by `Of`:
`rowOf(element)`, `dueInDaysOf(days)`, `sortOf(columns, sorting)`. The call then reads as a phrase —
"the row of this element" — and the name says what comes back before the arguments say where from.
Keep `Of` last; `ofRow(element)` stops reading as one.

### Props types

A component's props type is called `Props`. Lint rejects the component's name spelled into it, and
allows the prefix back where the name is the only thing telling two types apart: several props types
in one file, or a props type declared away from its component.

Somewhere else importing one renames it at the import — `import { type Props as AlertProps }` —
because `Props` means a component, and away from that component it no longer says which.

Callbacks go last, below every other prop.

## UI

### Components

Look for Mantine's component before building one out of primitive elements. Where one exists, wrap
it: Mantine supplies structure, accessibility and behaviour, the wrapper supplies the look and the
prop surface. Wrappers live in `apps/web/src/ui`, the one place allowed to import `@mantine/*`; lint
rejects the import anywhere else.

Hand-roll only when wrapping would mean fighting the component — overriding most of what it
declares, or bending a model it cannot express.

### Modal state

A modal's open state comes from `useDisclosure`, not from a `useState` boolean:

```tsx
const [draftOpened, draft] = useDisclosure(false)
```

`draft.open` and `draft.close` are stable and say what they do at the call site, which a
`setDraftOpened(false)` passed as a handler does not. The modal itself always renders and takes
`opened`; mounting it only while it is open throws its state away mid-interaction and skips the
closing transition.

### Table alignment

Every value in a table starts at the left edge of its column — amounts, counts and dates included.
Only a column of actions aligns to the end, so its buttons sit against the row's far edge. Do not
right-align a number for decimal alignment: this is a deliberate choice for this repo, not an
oversight to correct.

### Callbacks in JSX

A callback written inline in JSX stays there only while it is one expression —
`onChange={(value) => setSearch(value)}` reads as part of the prop. Anything longer is a function
with a body sitting in the middle of the markup, and the markup stops being readable as structure.

Give it a name in the component body instead, above the `return`, and pass the name:

```tsx
const returnToStep = (step: number) => {
  const stage = stages[step]

  if (stage !== undefined) {
    onReturnTo(stage)
  }
}

return <Stepper steps={labels} active={reached} onSelect={returnToStep} />
```

The name says what the handler does, which the inline body only implies, and the JSX goes back to
naming elements and their props.

### Styling

Styling reaches a component through its CSS module, never through a Mantine style prop.
`padding="md"`, `c="dimmed"` and `mt="lg"` read Mantine's scales, so the same name means one value
in the prop and another in the stylesheet, and a shell padded with `md` stops matching a header
padded with `var(--pz-spacing-md)`. Where Mantine takes a value it owns from a CSS variable, set
that variable in the module instead of passing the prop: `--app-shell-padding: var(--pz-spacing-md)`
on the shell's root is the `padding` prop, spelled in our tokens.

A prop still carries structure — what a component is made of, and the measurements Mantine has to
know to place the rest, such as the header height an `AppShell` offsets its main region by. Those
pass a `--pz-*` token rather than a number, so the value still has one home.

A component takes no styling prop. `padding="none"` or a `compact` flag spells a stylesheet into a
React API, and the next call site wants the variant it does not have. A call site that must change
how a component looks passes a class instead, and the component exposes the slot it lands on:
`className` for the root, named slots when something needs one. A prop carrying meaning is not this
— `Badge`'s tone outlives a redesign, `padding="none"` does not. Where the difference is structural,
composition beats both: `Card` pads nothing, and content that needs padding sits in `Card.Body`.

A set of rules that differ only by the variant in their name and their token is written as an
`@each` loop, not spelled out one rule at a time:

```css
@each $size in sm, md, lg {
  .$(size) {
    width: var(--pz-table-column-width-$(size));
  }
}
```

The loop says the rule once and makes the pattern the subject, so a reader checks one line instead
of diffing three, a new variant is one name in the list, and a rule that drifts from its siblings
cannot hide. Spell the rules out only where they stop being the same rule — a variant that reaches
for a second property, or a different one.

The override holds because every `*.module.css` under `src/ui` is wrapped in `@layer ui`, with
Mantine in `@layer mantine` below it and an app's stylesheets unlayered above both. No `!important`,
no doubled selector, no bundler order to get right;
[`packages/postcss-config/README.md`](packages/postcss-config/README.md) records what stays out.

A change of state moves rather than snaps. Hover, focus, the active route, a sidebar collapsing —
each animates over `--pz-motion-duration`, short enough to stay ahead of the pointer and long enough
to read as motion. The `transition` mixin carries the timing, and `globals.css` zeroes the token
under `prefers-reduced-motion`, so a rule adds the mixin and then names the properties it changes.
Name them: `transition-property: all` animates whatever the browser adds later, and layout
properties nobody meant to move.

### Design tokens

A component never names a colour or a size. It reads a `--pz-*` token from its CSS module, and never
a `--mantine-*` one: those are Mantine's names for values we own, and stylelint rejects them.

A token is written as a tree and its name is the path to it, joined by dashes: `text.color.dimmed`
reaches a stylesheet as `--pz-text-color-dimmed`, `spacing.md` as `--pz-spacing-md`. Nest as deep as
the name needs and no deeper. Every token lives in `tokens.ts`, and one is added when a component
reaches for it. The app has one colour scheme, the night sky; there is no light value to define.

### Surfaces

A container never picks its own background. It carries `data-surface`, and `globals.css` places it
one step of the `surface` ladder above the surface it is nested in: canvas, then levels 1 to 3,
deeper nesting staying on 3. A band inside a container — a card's title, a table's header — is a
surface of its own. Fades and pinned columns read the current surface through
`--pz-surface-background-color`, so they match whatever they sit on. A popover portalled out of the
page cannot be placed by nesting and names its level with the `surface` mixin.

Borders and dividers read `--pz-border-color`, which is translucent: it lightens or darkens whatever
lies beneath it by the same step, so one colour serves every level.

## Backend

`apps/backend` is a Hono application, deployed as one Supabase Edge Function. Each domain is a Hono
sub-app in its own top-level folder under `src`, exported from its barrel; `app.ts` mounts them
under their paths and does nothing else.

The function runs on Deno, not Node, with no process that outlives a request. Code and dependencies
stay on web standards — `Request`, `Response`, `fetch`, Web Crypto — rather than Node built-ins, and
a module does no work at import that every cold start would pay for. `pnpm dev` runs the same app on
Node for speed; a change that leans on the runtime is verified on the local Supabase stack.

## Pull requests

A pull request takes its description from [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md): the
same headings in the same order, each filled as the template asks, and nothing added around them.
The author writes every section except Screenshots from what the work actually did — no placeholder
is left for someone else. The description stays under 300 words, not counting the title and
screenshots.
