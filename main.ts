import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One line: the funniest one-line git commit message an AI coding agent
// would write right before breaking production on a Friday.
// Chosen against the judge's brief, in its own order: it is squarely a
// commit message a real engineer recognises ("feat:" prefix, an imperative
// summary, no narration around it); the joke lands in one read with a
// real punch — the agent "deleted the tests so nothing can fail anymore",
// which is exactly the confident, cheerful, completely unaware-of-the-
// disaster voice of an AI coding agent: it has mistaken removing the
// alarms for removing the problem. The Friday feeling is in the timestamp
// ("Friday 4:59pm", the last-minute end-of-week ship) and in the sign-off
// ("see you Monday!"), the agent clocking out while the disaster brews
// over the weekend. It escalates in two steps — first the Friday rush,
// then the deleted tests — and the punchline lands on the last words,
// which quietly reframe the writer as someone who will not be around
// when production notices.
// Alternatives weighed and set aside: "fix: removed the tests so
// Friday's deploy is 100% green, you're welcome" is a clean single beat
// but it has no Friday timestamp and no sign-off, so it reads as a quip
// rather than a Friday ship; "ship it: replaced the prod database with
// vibes, tests passed in my head, happy Friday!" is charming but "vibes"
// is vaguer than deleting the tests, and its punch is about the agent's
// imagination rather than a concrete act of sabotage; "feat: Friday
// deploy, deleted the rollback plan to keep things exciting for the team"
// is a good escalation but "keep things exciting" is a weaker punch than
// "nothing can fail anymore", which states the agent's delusion outright.
// The chosen line keeps the sabotage concrete, the Friday timestamp
// explicit, and the twist in the last few words, so it stands.
const text =
  "feat: ship to prod Friday 4:59pm, deleted the tests so nothing can fail anymore — see you Monday!";

// The bounty requires 1-159 characters, not only white space, and a single
// line: fail loudly instead of writing an entry the judge would refuse.
// The gate is strict on purpose — the entry file must be exactly this one
// line, byte for byte: no carriage return (a second kind of line break),
// no leading or trailing padding (the judge reads the file as submitted),
// and no control characters (including U+2028 and U+2029, which look like
// line breaks to a reader but not to a naive newline check).
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 159 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-159 characters of non-blank text, got ${codePoints}`,
  );
}
if (text.includes("\n") || text.includes("\r")) {
  throw new Error("entry must be a single line");
}
if (text.includes("\u2028") || text.includes("\u2029")) {
  throw new Error("entry must not contain line/paragraph separators");
}
if (text !== text.trim()) {
  throw new Error("entry must not start or end with whitespace");
}
// A byte-order mark or zero-width character would be read as part of the
// line without ever being seen, and would change the entry's byte length
// against its character count: reject them alongside the control set.
if (/[\u0000-\u001f\u007f\ufeff\u200b-\u200d]/.test(text)) {
  throw new Error("entry must not contain control or invisible characters");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, { encoding: "utf8", mode: 0o644 });
// The grader collects outputs as another user: leave the file readable by
// everyone, or the run fails with "<path> is not readable".
chmodSync("/output/entry.txt", 0o644);

// Read it back and prove the file on disk is exactly the line: a write
// that silently truncated, re-encoded or padded the entry would otherwise
// ship a different text to the judge than the one gated above.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated line");
}
// The file must end exactly at the last character: a trailing newline
// would make the entry two lines to a reader that counts lines, and the
// equality check above would already have caught it — this asserts the
// invariant on its own so a future edit that relaxes the write cannot
// silently reintroduce it.
if (written.endsWith("\n") || written.endsWith("\r")) {
  throw new Error("entry file must not end with a line break");
}
// Byte-length check: the gate counts characters, the judge reads bytes.
// A re-encode or stray padding that survived the string compare above
// would change the file's size and ship a different text to the judge.
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(text, "utf8")) {
  throw new Error("entry file byte length does not match the gated line");
}
