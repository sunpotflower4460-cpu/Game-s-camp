import { existsSync, readFileSync } from "node:fs"
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

function argsIndirectlyMentionCustom(args: string, constants: Map<string, string>): boolean {
  const identifierPattern = /\b[a-zA-Z_$][\w$]*\b/g
  let match: RegExpExecArray | null
  while ((match = identifierPattern.exec(args)) !== null) {
    const value = constants.get(match[0])
    if (value !== undefined && mentionsCustom(`"${value}"`)) {
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
// own report). Instead, scope the "mentions custom" check to the argument list of each write-API
// call site specifically, so only a write whose own arguments reference custom/ is flagged. This
// is still a text heuristic (not real path/AST analysis), but it catches the common computed-path
// case — e.g. `writeFileSync(join("custom", "rules.ts"), ...)` — without over-triggering.
function hasSuspiciousCustomWrite(source: string): boolean {
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
      if (mentionsCustom(args) || argsIndirectlyMentionCustom(args, localConstants)) {
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
    // `isInside` uses `path.relative`, which returns "" for two equal paths — neither direction
    // of the nesting check below would ever flag that as "inside" the other, even though two
    // identical roots is the worst-case overlap (every generated write is also a custom write).
    if (generatedRoot === customRoot) {
      issues.push({
        severity: "error",
        code: "custom_and_generated_identical",
        message: "custom/ and generated/ must not resolve to the same directory.",
        path: args.customDir,
      })
    } else {
      if (isInside(generatedRoot, customRoot)) {
        issues.push({
          severity: "error",
          code: "custom_path_inside_generated",
          message: "custom/ must not be inside generated/.",
          path: args.customDir,
        })
      }

      if (isInside(customRoot, generatedRoot)) {
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

    if (hasSuspiciousCustomWrite(source)) {
      issues.push({
        severity: "error",
        code: "script_mentions_custom_write",
        message: `Script appears to mention custom/ while performing filesystem writes: ${scriptPath}`,
        path: scriptPath,
      })
    }
  }

  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues,
  }
}
