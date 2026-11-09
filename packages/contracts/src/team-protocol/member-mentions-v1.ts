// Optional member-mentions-v1 contract. Only the named member receives the event, and only
// while they can read the chat. It contains IDs only. The client supplies its notification text.
import { isDynamicRecord, isString } from "../runtime-values";

export const MEMBER_MENTIONS_CAPABILITY = "member-mentions-v1";

export interface MemberMentionEvent {
  type: "member-mentioned";
  memberId: string;
  messageId: string;
  agentId: string | null;
  channelId: string | null;
  threadId: string | null;
}

const identifier = (value: unknown): value is string => isString(value) && value.length > 0 && value.length <= 256;

export function memberMentionEvent(value: unknown): MemberMentionEvent | null {
  if (!isDynamicRecord(value) || value.type !== "member-mentioned") return null;
  if (
    !identifier(value.memberId) ||
    !identifier(value.messageId) ||
    !(value.agentId === null || identifier(value.agentId)) ||
    !(value.channelId === null || identifier(value.channelId)) ||
    !(value.threadId === null || identifier(value.threadId)) ||
    (value.agentId === null && value.channelId === null)
  )
    throw new Error("Invalid member mention event.");
  return {
    type: "member-mentioned",
    memberId: value.memberId,
    messageId: value.messageId,
    agentId: value.agentId,
    channelId: value.channelId,
    threadId: value.threadId,
  };
}
