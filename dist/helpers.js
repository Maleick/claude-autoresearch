import { writeFileSync, mkdirSync, readFileSync, renameSync, unlinkSync, existsSync } from "fs";
import { resolve, dirname } from "path";
export class AutoresearchError extends Error {
    constructor(message) {
        super(message);
        this.name = "AutoresearchError";
    }
}
export function printJson(payload) {
    console.log(JSON.stringify(payload, null, 2));
}
export function utcNow() {
    return new Date().toISOString().replace("Z", "+00:00").split("+")[0] + "Z";
}
export function resolveRepo(repo) {
    return repo ?? process.cwd();
}
export function ensureParent(filePath) {
    mkdirSync(dirname(filePath), { recursive: true });
}
function atomicWriteText(filePath, content) {
    ensureParent(filePath);
    const tmp = filePath + ".tmp." + Date.now();
    writeFileSync(tmp, content, "utf-8");
    try {
        renameSync(tmp, filePath);
    }
    catch {
        try {
            unlinkSync(tmp);
        }
        catch { /* ignore */ }
        throw new AutoresearchError("Failed to write " + filePath);
    }
}
export function atomicWriteJson(filePath, payload) {
    atomicWriteText(filePath, JSON.stringify(payload, null, 2) + "\n");
}
export function readJsonFile(filePath) {
    if (!existsSync(filePath)) {
        throw new AutoresearchError("Missing file: " + filePath);
    }
    try {
        return JSON.parse(readFileSync(filePath, "utf-8"));
    }
    catch (err) {
        throw new AutoresearchError("Invalid JSON in " + filePath + ": " + err.message);
    }
}
export function resolvePath(repo, value, defaultName) {
    if (value) {
        return value.startsWith("/") ? value : resolve(repo ?? ".", value);
    }
    return resolve(repo ?? ".", defaultName);
}
export function normalizeDirection(value) {
    if (!value)
        return "lower";
    const normalized = value.trim().toLowerCase();
    if (normalized !== "lower" && normalized !== "higher") {
        throw new AutoresearchError("Unsupported direction: " + value);
    }
    return normalized;
}
export function normalizeMode(value) {
    if (!value)
        return "foreground";
    const normalized = value.trim().toLowerCase();
    if (normalized !== "foreground" && normalized !== "background") {
        throw new AutoresearchError("Unsupported mode: " + value);
    }
    return normalized;
}
export function normalizeResultStatus(value, fieldName) {
    if (!value)
        throw new AutoresearchError("Missing " + fieldName);
    const normalized = value.trim().toLowerCase();
    if (!["pass", "fail", "skip"].includes(normalized)) {
        throw new AutoresearchError("Unsupported " + fieldName + ": " + value);
    }
    return normalized;
}
export function parseDurationSeconds(value) {
    if (!value)
        return null;
    const normalized = value.trim().toLowerCase();
    if (!normalized)
        return null;
    if (/^\d+$/.test(normalized)) {
        const n = parseInt(normalized);
        if (n <= 0)
            throw new AutoresearchError("Invalid duration: " + value);
        return n;
    }
    const tokens = [...normalized.matchAll(/(\d+)([smhd])/g)];
    let total = 0;
    let pos = 0;
    for (const match of tokens) {
        if (match.index !== pos) {
            throw new AutoresearchError("Invalid duration: " + value);
        }
        const amount = parseInt(match[1]);
        const unit = match[2];
        const multiplier = { s: 1, m: 60, h: 3600, d: 86400 };
        total += amount * multiplier[unit];
        pos += match[0].length;
    }
    if (pos !== normalized.length || total <= 0) {
        throw new AutoresearchError("Invalid duration: " + value);
    }
    return total;
}
export function inferVerifyCommand(repo) {
    const base = repo ?? ".";
    const hasPkg = existsSync(resolve(base, "package.json"));
    if (hasPkg) {
        const pkg = JSON.parse(readFileSync(resolve(base, "package.json"), "utf-8"));
        if (pkg.scripts?.test)
            return "npm test";
    }
    const makeFile = resolve(base, "Makefile");
    if (existsSync(makeFile))
        return "make test";
    if (existsSync(resolve(base, "go.mod")))
        return "go test ./...";
    if (existsSync(resolve(base, "Cargo.toml")))
        return "cargo test";
    if (existsSync(resolve(base, "pytest.ini")) || existsSync(resolve(base, "tests")))
        return "pytest";
    return "<set verify command>";
}
export function normalizeLabels(values) {
    if (!values)
        return [];
    if (typeof values === "string") {
        return [...new Set(values.split(",").map((s) => s.trim()).filter(Boolean))];
    }
    if (!Array.isArray(values))
        return [];
    return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}
export function missingRequiredLabels(labels, required) {
    const labelSet = new Set(labels);
    return required.filter((l) => !labelSet.has(l));
}
export function parseTsvFile(content) {
    const lines = content.trim().split("\n");
    if (lines.length <= 1)
        return [];
    const headers = lines[0].split("\t");
    return lines.slice(1).filter(Boolean).map((r) => {
        const cols = r.split("\t");
        const obj = {};
        headers.forEach((h, i) => { obj[h] = cols[i] ?? ""; });
        return obj;
    });
}
export function countTsvDataRows(content) {
    const lines = content.trim().split("\n");
    return lines.length > 1 ? lines.slice(1).filter((l) => l.trim()).length : 0;
}
//# sourceMappingURL=helpers.js.map