import { chatTagReferences } from "@openbot/contracts/chat-tag-references";
import type { MemberMentionEvent } from "@openbot/contracts/team-protocol/member-mentions-v1";

/** One notice per named person, after the message commits. A sender never notifies themself. */
export function memberMentionEvents(
  text: string,
  senderId: string | undefined,
  target: Pick<MemberMentionEvent, "messageId" | "agentId" | "channelId" | "threadId">,
): MemberMentionEvent[] {
  const ids = new Set(
    chatTagReferences(text)
      .filter((tag) => tag.kind === "member" && tag.id !== senderId)
      .map((tag) => tag.id),
  );
  return [...ids].map((memberId) => ({ type: "member-mentioned", memberId, ...target }));
}
