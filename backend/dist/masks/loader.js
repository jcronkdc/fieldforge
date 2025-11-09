"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const registry_js_1 = require("./registry.js");
async function main() {
    const maskPathArg = process.argv[2] ?? "../../masks/professor.malachai.json";
    const absolutePath = path_1.default.isAbsolute(maskPathArg) ? maskPathArg : path_1.default.resolve(process.cwd(), maskPathArg);
    const raw = await (0, promises_1.readFile)(absolutePath, "utf-8");
    const json = JSON.parse(raw);
    const metadata = {
        maskId: json.id,
        displayName: json.display_name,
        domains: json.domains ?? [],
        defaultVersion: json.version,
        status: json.status ?? "draft",
        tags: json.tags ?? [],
    };
    const version = {
        maskId: json.id,
        version: json.version,
        changelog: json.changelog ?? null,
        persona: json.persona ?? {},
        promptSchema: json.prompt_schema ?? {},
        skillset: json.skillset ?? [],
        llmPreset: json.llm_preset ?? "gpt-4o-mini",
        maxContextTokens: json.max_context_tokens ?? 4096,
        safetyTags: json.safety_tags ?? [],
    };
    await registry_js_1.maskRegistry.registerMask(metadata, version);
    console.log(`Registered mask ${metadata.maskId} version ${version.version}`);
    await registry_js_1.maskRegistry.close();
}
main().catch((error) => {
    console.error("Failed to register mask", error);
    process.exitCode = 1;
});
