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
export async function atomicWriteText(filePath, content) {
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
export async function atomicWriteJson(filePath, payload) {
    await atomicWriteText(filePath, JSON.stringify(payload, null, 2) + "\n");
}
export function readJsonFile(filePath) {
    try {
        return JSON.parse(readFileSync(filePath, "utf-8"));
    }
    catch {
        throw new AutoresearchError("Missing file: " + filePath);
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
        total += amount * (multiplier[unit] ?? 0);
        pos += match[0].length;
    }
    if (pos !== normalized.length || total <= 0) {
        throw new AutoresearchError("Invalid duration: " + value);
    }
    return total;
}
export function inferVerifyCommand(repo) {
    const base = repo ?? ".";
    const pyFile = resolve(base, "pytest.ini");
    const testsDir = resolve(base, "tests");
    const hasPy = existsSync(pyFile) || existsSync(testsDir);
    if (hasPy)
        return "pytest";
    const hasMake = existsSync(resolve(base, "Makefile"));
    if (hasMake)
        return "make test";
    const hasPkg = existsSync(resolve(base, "package.json"));
    if (hasPkg)
        return "npm test";
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
//# sourceMappingURL=helpers.js.map