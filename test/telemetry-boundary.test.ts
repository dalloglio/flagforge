import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const checkedRoots = ["src/domain", "src/application"];
const checkedApiModules = [
  "src/api/admin-auth.ts",
  "src/api/admin-rate-limit.ts",
  "src/api/app.ts",
  "src/api/errors.ts",
];
const forbiddenImportPattern =
  /from\s+["'](?:@opentelemetry\/|@opentelemetry-|prom-client|grafana|datadog|aws-sdk|@aws-sdk\/|kubernetes|@kubernetes\/|collector)/;

describe("telemetry architecture boundaries", () => {
  it("keeps telemetry and platform instrumentation imports out of domain, application, and API modules", () => {
    const violations = [
      ...checkedRoots.flatMap((root) => listTypeScriptFiles(root)),
      ...checkedApiModules,
    ].flatMap((filePath) => {
      const source = readFileSync(filePath, "utf8");
      return forbiddenImportPattern.test(source) ? [filePath] : [];
    });

    expect(violations).toEqual([]);
  });
});

function listTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stat = statSync(path);

    if (stat.isDirectory()) {
      return listTypeScriptFiles(path);
    }

    return path.endsWith(".ts") ? [path] : [];
  });
}
