import { describe, expect, it } from "vitest";
import {
  decodeHostSkillLearningFromMain,
  decodeMarketplaceAgentDetail,
  decodeMarketplaceAgentPage,
  decodeSaveSkillSuggestionResultFromMain,
} from "./skills-decoding";

const SUMMARY = {
  category: "coding",
  id: "0f8fad5b-d9cb-469f-a165-70867728950e",
  name: "Release Scout",
  title: "Release manager",
  description: "Checks every release.",
  creatorName: "Ada",
  creatorAvatarUrl: null,
  version: 1,
  installs: 0,
  featured: true,
  avatarSeed: "scout",
  avatarHue: null,
  avatarUrl: null,
  skillCount: 0,
  routineCount: 0,
  activeRoutineCount: 0,
  updatedAt: "2026-10-31T00:00:00.000Z",
};

const DETAIL = { ...SUMMARY, versionId: "av-1", skills: [], routines: [] };

describe("Skill learning answers from main", () => {
  it("keeps the choices of a host with a newer mode", () => {
    const answer = { mode: "review-first", choices: ["review-first", "off"] };
    expect(decodeHostSkillLearningFromMain(answer)).toEqual(answer);
  });

  it.each([
    null,
    [],
    {},
    { mode: 1, choices: ["off"] },
    { mode: "off", choices: "off" },
    { mode: "off", choices: ["off", null] },
  ])("refuses a malformed skill learning setting", (value) => {
    expect(() => decodeHostSkillLearningFromMain(value)).toThrow("Invalid skill learning setting.");
  });

  it.each([true, false])("keeps the saved result %s", (saved) => {
    expect(decodeSaveSkillSuggestionResultFromMain({ saved })).toEqual({ saved });
  });

  it.each([null, [], {}, { saved: "true" }, { saved: 1 }, { saved: null }])(
    "refuses a malformed save result",
    (value) => {
      expect(() => decodeSaveSkillSuggestionResultFromMain(value)).toThrow("Invalid skill suggestion result.");
    },
  );
});

// The shield, the Verified filter and the trust line read these flags. A Worker before them sends
// none, and the agent is then a public one that OpenBot reviewed.
describe("Marketplace agent decoding", () => {
  it.each([true, false])("keeps verified %s in a catalog page", (verified) => {
    const page = decodeMarketplaceAgentPage({ agents: [{ ...SUMMARY, verified }], nextCursor: null });
    expect(page.agents[0]?.verified).toBe(verified);
  });

  it("keeps verified and pending in a listing", () => {
    expect(decodeMarketplaceAgentDetail({ ...DETAIL, verified: true, pending: true })).toMatchObject({
      verified: true,
      pending: true,
    });
  });

  it.each([
    ["absent", {}],
    ["not booleans", { verified: "yes", pending: 1 }],
  ])("leaves out flags that are %s", (_name, flags) => {
    const detail = decodeMarketplaceAgentDetail({ ...DETAIL, ...flags });
    expect(detail).not.toHaveProperty("verified");
    expect(detail).not.toHaveProperty("pending");
  });
});
