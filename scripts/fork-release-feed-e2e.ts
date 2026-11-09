import { mkdir, writeFile } from "node:fs/promises";
import { createOpenBotLogger } from "@openbot/logging";
import { Effect } from "effect";

const logger = createOpenBotLogger("fork-release-feed-e2e");
process.env.OPENBOT_RELEASE_REPOSITORY = "jheitman-BGCH/openbot";
const { HostReleaseService } = await import("../src/main/host-release-service");
const requests: string[] = [];
let unavailable = false;
const server = Bun.serve({
  port: 0,
  fetch(request) {
    if (unavailable) return new Response("Unavailable", { status: 503 });
    const path = new URL(request.url).pathname;
    const asset = path.endsWith("latest-mac.yml") ? "OpenBot-99.0.0-arm64.zip" : "OpenBot-99.0.0-x64.exe";
    return new Response(`version: 99.0.0\nfiles:\n  - url: ${asset}\n`);
  },
});

const checks: string[] = [];
try {
  for (const platform of ["darwin", "win32"] as const) {
    const service = new HostReleaseService({
      currentVersion: "0.65.0",
      packaged: true,
      platform,
      arch: platform === "darwin" ? "arm64" : "x64",
      environment: {},
      installationMode: null,
      updateStatus: () => ({ phase: "up-to-date", managedByHost: false }),
      fetch: Object.assign(
        async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
          const url = String(input);
          requests.push(url);
          if (!url.startsWith("https://github.com/jheitman-BGCH/openbot/releases/latest/download/")) {
            throw new Error("Release discovery left the fork repository.");
          }
          return fetch(new URL(new URL(url).pathname, server.url), init);
        },
        { preconnect: fetch.preconnect },
      ),
    });
    unavailable = false;
    const available = await Effect.runPromise(service.check());
    if (available.phase !== "available" || available.latestVersion !== "99.0.0") {
      throw new Error(`The ${platform} host did not find the fork release.`);
    }
    checks.push(`${platform}: discover the fork release`);

    unavailable = true;
    const count = requests.length;
    const missing = await Effect.runPromise(service.check());
    if (missing.phase !== "error" || missing.latestVersion !== null || requests.length !== count + 1) {
      throw new Error(`The ${platform} host did not clear the unavailable release without a fallback.`);
    }
    checks.push(`${platform}: an unavailable fork feed clears the release without an upstream fallback`);
  }
  const directory = ".openbot-build/fork-release-feed-e2e";
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}/report.json`, `${JSON.stringify({ passed: true, checks, requests }, null, 2)}\n`);
  logger.info("Fork release discovery E2E passed.");
} finally {
  await server.stop(true);
}
