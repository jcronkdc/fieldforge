import { readFile } from "fs/promises";
import path from "path";
import { maskRegistry } from "./registry.js";
import type { MaskMetadata, MaskVersion } from "./types.js";

async function main() {
  const maskPathArg = process.argv[2] ?? "../../masks/professor.malachai.json";
  const absolutePath = path.isAbsolute(maskPathArg) ? maskPathArg : path.resolve(process.cwd(), maskPathArg);

  const raw = await readFile(absolutePath, "utf-8");
  const json = JSON.parse(raw);

  const metadata: MaskMetadata = {
    maskId: json.id,
    displayName: json.display_name,
    domains: json.domains ?? [],
    defaultVersion: json.version,
    status: json.status ?? "draft",
    tags: json.tags ?? [],
  };

  const version: MaskVersion = {
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

  await maskRegistry.registerMask(metadata, version);
  console.log(`Registered mask ${metadata.maskId} version ${version.version}`);
  await maskRegistry.close();
}

main().catch((error) => {
  console.error("Failed to register mask", error);
  process.exitCode = 1;
});

