import { describe, it, expect } from "vitest";
import { buildHealthCheckClientConfig } from "./sanity-health-client";

const env = {
  NEXT_PUBLIC_SANITY_PROJECT_ID: "test-project",
  NEXT_PUBLIC_SANITY_DATASET: "production",
};

describe("buildHealthCheckClientConfig", () => {
  it("never sends a token, even when tokens are configured (regression: expired token 401'd validate)", () => {
    const config = buildHealthCheckClientConfig({
      ...env,
      SANITY_API_READ_TOKEN: "expired-read-token",
      SANITY_API_WRITE_TOKEN: "expired-write-token",
    });
    expect(config).not.toHaveProperty("token");
  });

  it("reads only published content, matching what the live site renders", () => {
    expect(buildHealthCheckClientConfig(env).perspective).toBe("published");
  });

  it("targets the project and dataset from the environment", () => {
    const config = buildHealthCheckClientConfig(env);
    expect(config.projectId).toBe("test-project");
    expect(config.dataset).toBe("production");
  });

  it("bypasses the CDN so freshly published content is checked", () => {
    expect(buildHealthCheckClientConfig(env).useCdn).toBe(false);
  });

  it("throws a clear error when the project ID is missing", () => {
    expect(() =>
      buildHealthCheckClientConfig({ NEXT_PUBLIC_SANITY_DATASET: "production" }),
    ).toThrow(/NEXT_PUBLIC_SANITY_PROJECT_ID/);
  });

  it("throws a clear error when the dataset is missing", () => {
    expect(() =>
      buildHealthCheckClientConfig({ NEXT_PUBLIC_SANITY_PROJECT_ID: "test-project" }),
    ).toThrow(/NEXT_PUBLIC_SANITY_DATASET/);
  });
});
