import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

function readRepoFile(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

describe("AWS GitOps desired state", () => {
  it("keeps AWS dev values account-neutral and externally secret-backed", () => {
    const values = readRepoFile(
      "infra/aws/gitops/dev/us-east-1/values-aws-dev.yaml",
    );

    expect(values).toContain(
      "<aws-account-id>.dkr.ecr.us-east-1.amazonaws.com/flagforge-api",
    );
    expect(values).toContain('tag: "<yyyymmdd>.<short-sha>"');
    expect(values).toContain("create: false");
    expect(values).toContain("existingSecret: flagforge-api-runtime");
    expect(values).not.toMatch(/\b\d{12}\b/);
    expect(values).not.toContain("dev-admin-api-key");
    expect(values).not.toContain("postgres://");
  });

  it("points the AWS Application at the Helm chart and AWS values", () => {
    const application = readRepoFile(
      "infra/aws/gitops/dev/us-east-1/flagforge-api-application.yaml",
    );

    expect(application).toContain("path: charts/flagforge-api");
    expect(application).toContain(
      "$values/infra/aws/gitops/dev/us-east-1/values-aws-dev.yaml",
    );
    expect(application).toContain("namespace: flagforge");
    expect(application).not.toContain("automated:");
  });

  it("keeps AWS GitOps validation credential-free", () => {
    const packageJson = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>;
    };
    const script = packageJson.scripts["gitops:aws:validate"];

    expect(script).toContain("helm lint charts/flagforge-api");
    expect(script).toContain(
      "helm template flagforge-api charts/flagforge-api",
    );
    expect(script).not.toMatch(/\b(kubectl|argocd|docker)\b/);
    expect(script).not.toMatch(/\baws\s+/);
    expect(packageJson.scripts.verify).not.toContain("gitops:aws:validate");
  });
});
