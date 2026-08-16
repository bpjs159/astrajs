#!/usr/bin/env node

/**
 * bump-version.cjs — post-commit hook (adapted from dialo-app)
 *
 * Runs after a commit is created. Reads the commit message from the
 * just-created commit via `git log -1`, determines the bump level, updates
 * the `version` field in EVERY package.json in the repo (root, packages,
 * examples, apps, templates), appends an entry to the README.md changelog,
 * stages the changes, and amends the commit to include them.
 *
 * Bump rules:
 *   BREAKING CHANGE / !:   → major
 *   feat: / feat(…):       → minor
 *   fix: / docs: / chore:  → patch (or anything else)
 *
 * A state file (.git/ASTRAJS_BUMP_LOCK) prevents infinite loops when the
 * amend triggers this hook again.
 *
 * When invoked with arguments (from prepare-commit-msg), it does nothing —
 * the actual bump work happens in post-commit only.
 */

const fs = require("fs");
const path = require("path");
const { execSync, execFileSync } = require("child_process");

// ── Config ──────────────────────────────────────────────────────────────

const README_FILE = "README.md";
const CHANGELOG_HEADER = "## 📋 Changelog";
const LOCK_FILE = ".git/ASTRAJS_BUMP_LOCK";

/** Directory names that are never scanned for package.json files. */
const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);

// ── Helpers ─────────────────────────────────────────────────────────────

/**
 * Determines the semver bump level from a commit message.
 * @param {string} msg - The full commit message.
 * @returns {"major"|"minor"|"patch"} The bump level.
 */
function bumpLevelFromMessage(msg) {
  const subject = msg.split("\n")[0].trim();
  if (/BREAKING\s+CHANGE/i.test(msg)) return "major";
  if (/^\w+(\(.*\))?!:/.test(subject)) return "major";
  if (/^feat(\(.*\))?:/.test(subject)) return "minor";
  return "patch";
}

/**
 * Increments a semver string by the given level.
 * @param {string} version - The current version (e.g. "1.2.3").
 * @param {"major"|"minor"|"patch"} level - The bump level.
 * @returns {string} The new version.
 */
function incrementVersion(version, level) {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3) return version;
  if (level === "major") { parts[0] += 1; parts[1] = 0; parts[2] = 0; }
  else if (level === "minor") { parts[1] += 1; parts[2] = 0; }
  else { parts[2] += 1; }
  return parts.join(".");
}

/** @param {string} filePath @returns {object} */
function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/** @param {string} filePath @param {object} data */
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/** @param {string} repoRoot @param {string} rel @returns {boolean} */
function isGitIgnored(repoRoot, rel) {
  try {
    execFileSync("git", ["check-ignore", "-q", "--", rel], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Recursively finds every package.json in the repo that git tracks
 * (not ignored, not inside node_modules / dist / .git).
 * @param {string} repoRoot - Absolute path to the repo root.
 * @returns {string[]} Paths relative to repoRoot, sorted.
 */
function findPackageFiles(repoRoot) {
  const results = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (_) {
      return; // unreadable directory
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        walk(full);
      } else if (entry.name === "package.json") {
        const rel = path.relative(repoRoot, full);
        if (isGitIgnored(repoRoot, rel)) continue;
        results.push(rel);
      }
    }
  };
  walk(repoRoot);
  return results.sort();
}

/**
 * Performs the version bump: updates every package.json file and the README
 * changelog, stages them, and amends the current commit.
 * @param {string} repoRoot - Absolute path to the repo root.
 * @param {string} message - The commit message to use for the changelog entry.
 */
function performBump(repoRoot, message) {
  const level = bumpLevelFromMessage(message);

  const rootPkg = readJson(path.join(repoRoot, "package.json"));
  const oldVersion = rootPkg.version;
  const newVersion = incrementVersion(oldVersion, level);

  if (oldVersion === newVersion) {
    console.log("[bump-version] Version unchanged. Skipping.");
    return false;
  }

  console.log(`[bump-version] ${oldVersion} → ${newVersion} (${level})`);

  // ── Update every package.json in the repo ────────────────────────────
  const files = findPackageFiles(repoRoot);
  if (files.length === 0) {
    console.log("[bump-version] No package.json files found. Skipping.");
    return false;
  }

  for (const file of files) {
    const fullPath = path.join(repoRoot, file);
    const pkg = readJson(fullPath);
    pkg.version = newVersion;
    writeJson(fullPath, pkg);
    console.log(`[bump-version] Updated ${file}`);
  }

  // ── Update README.md changelog ──────────────────────────────────────
  const readmePath = path.join(repoRoot, README_FILE);
  let readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf-8") : "";

  const subject = message.split("\n")[0].substring(0, 100);
  const date = new Date().toISOString().slice(0, 10);
  const entry = `- **${newVersion}** (${date}): ${subject}\n`;

  if (readme.includes(CHANGELOG_HEADER)) {
    readme = readme.replace(CHANGELOG_HEADER, `${CHANGELOG_HEADER}\n\n${entry}`);
  } else {
    readme = readme.trimEnd() + `\n\n${CHANGELOG_HEADER}\n\n${entry}`;
  }

  fs.writeFileSync(readmePath, readme, "utf-8");
  console.log(`[bump-version] Updated ${README_FILE}`);

  // ── Stage the changes ───────────────────────────────────────────────
  execFileSync("git", ["add", "--", ...files, README_FILE], { cwd: repoRoot });
  console.log("[bump-version] Staged version bump + changelog.");

  // ── Amend the commit to include the bump ─────────────────────────────
  console.log("[bump-version] Amending commit to include version bump...");
  execFileSync("git", ["commit", "--amend", "--no-edit"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  console.log("[bump-version] Commit amended successfully.");

  return true;
}

// ── Main ────────────────────────────────────────────────────────────────

function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const lockPath = path.join(repoRoot, LOCK_FILE);

  // ── If called from prepare-commit-msg (has file path arg), skip ─────
  // The real work happens in post-commit, which can read the message
  // from the just-created commit and can still amend files into it.
  const msgFilePath = process.argv[2];
  if (msgFilePath) {
    console.log("[bump-version] Called from prepare-commit-msg; deferring to post-commit.");
    process.exit(0);
  }

  // ── Re-entrant guard: if the lock file exists we are inside an amend ──
  // triggered by our own post-commit, so just clean up and exit.
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log("[bump-version] Re-entrant call detected. Cleaning up lock.");
    process.exit(0);
  }

  // ── Read commit message from the just-created commit ─────────────────
  let message = "";
  try {
    message = execSync("git log -1 --format=%B", { cwd: repoRoot, encoding: "utf-8" }).trim();
  } catch (_) {
    // Not in a git repo or no commits yet
  }

  if (!message) {
    console.log("[bump-version] No commit message available. Skipping.");
    process.exit(0);
  }

  // Skip if already a bump commit
  if (/^chore:\s*bump/i.test(message)) {
    console.log("[bump-version] Bump commit detected. Skipping.");
    process.exit(0);
  }

  // ── Create lock to guard against re-entrant calls from amend ─────────
  fs.writeFileSync(lockPath, String(process.pid));

  try {
    performBump(repoRoot, message);
  } finally {
    // Clean up lock file (may already be cleaned by re-entrant call)
    try { fs.unlinkSync(lockPath); } catch (_) { /* already removed */ }
  }
}

main();
