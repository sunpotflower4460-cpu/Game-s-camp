import { existsSync, readFileSync, realpathSync } from "node:fs"
import { isAbsolute, relative, resolve } from "node:path"

import type {
  GeneratedCustomSafetyIssue,
  GeneratedCustomSafetyResult,
} from "./generatedCustomSafety.types"

// `resolve(relativePath)` always yields an absolute path (it resolves against `process.cwd()`),
// so checking whether THAT starts with "/" is always true and can never actually detect nesting —
// the correct test is whether the relative path itself, before resolving it against anything, is
// already absolute (which `path.relative` only returns on Windows across different drives).
function isInside(parent: string, child: string): boolean {
  const relativePath = relative(parent, child)
  return relativePath !== "" && !relativePath.startsWith("..") && !isAbsolute(relativePath)
}

const WRITE_APIS = [
  "writeFileSync",
  "mkdirSync",
  "rmSync",
  "renameSync",
  "appendFileSync",
  "copyFileSync",
  "cpSync",
  "unlinkSync",
  "rmdirSync",
  "symlinkSync",
  "linkSync",
  // Callback- and promise-based (`fs.promises.*`/`node:fs/promises`) variants share these same
  // bare names, so a generator using `writeFile`/`fs.promises.writeFile`/etc. instead of the
  // *Sync form would otherwise evade this scan entirely.
  "writeFile",
  "mkdir",
  "rm",
  "rename",
  "appendFile",
  "copyFile",
  "cp",
  "unlink",
  "rmdir",
  "symlink",
  "link",
]

function mentionsCustom(text: string): boolean {
  return text.includes("custom/") || text.includes('"custom"') || text.includes("'custom'")
}

// A raw write API whose arguments mention "generated/" bypasses `writeGeneratedFile` for
// generated-output writes just as surely as one mentioning "custom/" bypasses it for the
// protected directory — every real write into generated/ is supposed to go through the safe
// writer, not a bare `fs` call, regardless of which directory it targets.
function mentionsGenerated(text: string): boolean {
  return text.includes("generated/") || text.includes('"generated"') || text.includes("'generated'")
}

// Resolves simple `const NAME = "literal"` / `let NAME = "literal"` / `var NAME = "literal"`
// bindings so a write call that references a local variable instead of an inline string —
// e.g. `const root = "custom"; writeFileSync(join(root, "rules.ts"), ...)` — can still be
// checked against the variable's actual value. This is a single-hop, same-file resolution only
// (not real dataflow analysis), but it closes the most obvious way to defeat a purely
// inline-literal text scan without chasing arbitrarily obfuscated indirection.
function collectLocalStringConstants(source: string): Map<string, string> {
  const constants = new Map<string, string>()
  const declarationPattern = /\b(?:const|let|var)\s+([a-zA-Z_$][\w$]*)\s*=\s*(["'])((?:(?!\2).)*)\2/g
  let match: RegExpExecArray | null
  while ((match = declarationPattern.exec(source)) !== null) {
    constants.set(match[1], match[3])
  }
  return constants
}

function argsIndirectlyMention(
  args: string,
  constants: Map<string, string>,
  mentions: (text: string) => boolean,
): boolean {
  const identifierPattern = /\b[a-zA-Z_$][\w$]*\b/g
  let match: RegExpExecArray | null
  while ((match = identifierPattern.exec(args)) !== null) {
    const value = constants.get(match[0])
    if (value !== undefined && mentions(`"${value}"`)) {
      return true
    }
  }
  return false
}

// Extracts the balanced-paren argument text starting at the `(` found at `openParenIndex`, so a
// nested call like `writeFileSync(join("custom", "rules.ts"), contents)` is inspected as a whole
// instead of stopping at the first `)` (which belongs to the inner `join(...)`).
function extractBalancedArgs(source: string, openParenIndex: number): string {
  let depth = 0
  let args = ""
  for (let i = openParenIndex; i < source.length; i++) {
    const char = source[i]
    if (char === "(") {
      depth++
      if (depth === 1) {
        continue
      }
    }
    if (char === ")") {
      depth--
      if (depth === 0) {
        break
      }
    }
    args += char
  }
  return args
}

// A plain "does this file mention custom/ AND a write API anywhere" check would flag legitimate
// scripts that reference "custom" for an unrelated reason (e.g. this very check's own runner,
// which passes `customDir: "custom"` to `checkGeneratedCustomSafety` while separately writing its
// own report). Instead, scope the "mentions custom"/"mentions generated" check to the argument
// list of each write-API call site specifically, so only a write whose own arguments reference
// the protected directory is flagged. This is still a text heuristic (not real path/AST
// analysis), but it catches the common computed-path case — e.g.
// `writeFileSync(join("custom", "rules.ts"), ...)` — without over-triggering.
//
// This scan is a best-effort early warning for an obviously-misbehaving generator, not the actual
// security boundary — it can always be defeated by import aliasing (`import { writeFile as save }
// ...`), re-exports, computed member access, or any other renaming a real AST/symbol-resolution
// pass would be needed to see through. The real boundary is `writeGeneratedFile` /
// `pruneStaleGeneratedFiles`: they validate the *actual resolved destination path* at the moment
// of the real filesystem call, so no amount of renaming the call site changes what gets checked.
// Chasing every possible obfuscation of this text scan has diminishing returns; deliberately not
// doing so here.
function hasSuspiciousWrite(source: string, mentions: (text: string) => boolean): boolean {
  const localConstants = collectLocalStringConstants(source)
  for (const api of WRITE_APIS) {
    // Only treat an occurrence as a genuine call site if the API name is immediately followed
    // (modulo whitespace) by "(" — otherwise a bare mention (e.g. inside an `import { ... }`
    // list) would make the code below jump ahead to the next unrelated "(" anywhere later in the
    // file and misattribute that call's arguments to this API name.
    const callPattern = new RegExp(`\\b${api}\\s*\\(`, "g")
    let match: RegExpExecArray | null
    while ((match = callPattern.exec(source)) !== null) {
      const openParenIndex = match.index + match[0].length - 1
      const args = extractBalancedArgs(source, openParenIndex)
      if (mentions(args) || argsIndirectlyMention(args, localConstants, mentions)) {
        return true
      }
    }
  }
  return false
}

export function checkGeneratedCustomSafety(args: {
  generatedDir: string
  customDir: string
  scriptsToInspect: string[]
}): GeneratedCustomSafetyResult {
  const issues: GeneratedCustomSafetyIssue[] = []
  const generatedRoot = resolve(args.generatedDir)
  const customRoot = resolve(args.customDir)

  if (!existsSync(generatedRoot)) {
    issues.push({
      severity: "error",
      code: "missing_generated_dir",
      message: `Missing generated directory: ${args.generatedDir}`,
      path: args.generatedDir,
    })
  }

  if (!existsSync(customRoot)) {
    issues.push({
      severity: "error",
      code: "missing_custom_dir",
      message: `Missing custom directory: ${args.customDir}`,
      path: args.customDir,
    })
  }

  if (existsSync(generatedRoot) && existsSync(customRoot)) {
    // Two different lexical paths (e.g. two distinct symlinks) can still resolve to the same real
    // directory, which the nominal `resolve()`-only comparison below can't see — realpath both
    // once so equality/nesting reflects where they actually point, not just how they're spelled.
    const realGeneratedRoot = realpathSync(generatedRoot)
    const realCustomRoot = realpathSync(customRoot)

    // `isInside` uses `path.relative`, which returns "" for two equal paths — neither direction
    // of the nesting check below would ever flag that as "inside" the other, even though two
    // identical roots is the worst-case overlap (every generated write is also a custom write).
    if (realGeneratedRoot === realCustomRoot) {
      issues.push({
        severity: "error",
        code: "custom_and_generated_identical",
        message: "custom/ and generated/ must not resolve to the same directory.",
        path: args.customDir,
      })
    } else {
      if (isInside(realGeneratedRoot, realCustomRoot)) {
        issues.push({
          severity: "error",
          code: "custom_path_inside_generated",
          message: "custom/ must not be inside generated/.",
          path: args.customDir,
        })
      }

      if (isInside(realCustomRoot, realGeneratedRoot)) {
        issues.push({
          severity: "error",
          code: "generated_path_inside_custom",
          message: "generated/ must not be inside custom/.",
          path: args.generatedDir,
        })
      }
    }
  }

  for (const scriptPath of args.scriptsToInspect) {
    if (!existsSync(scriptPath)) {
      continue
    }

    const source = readFileSync(scriptPath, "utf-8")

    if (hasSuspiciousWrite(source, mentionsCustom)) {
      issues.push({
        severity: "error",
        code: "script_mentions_custom_write",
        message: `Script appears to mention custom/ while performing filesystem writes: ${scriptPath}`,
        path: scriptPath,
      })
    }

    if (hasSuspiciousWrite(source, mentionsGenerated)) {
      issues.push({
        severity: "error",
        code: "script_mentions_generated_write",
        message: `Script appears to write into generated/ using a raw filesystem call instead of writeGeneratedFile: ${scriptPath}`,
        path: scriptPath,
      })
    }
  }

  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues,
  }
}
