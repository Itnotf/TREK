import type { AiToolSpec } from '../ai-connections/ai-chat-client.interface';
import {
  ASSISTANT_FOLLOW_UPS_TOOL,
  type AssistantFollowUps,
  MAX_FOLLOW_UP_CHARS,
  MAX_FOLLOW_UP_QUESTION_CHARS,
  MAX_FOLLOW_UPS,
} from '@trek/shared';

/**
 * What the user may ask next, offered by the model itself at the end of an
 * answer, so the chips under it follow the conversation (a hike asks about
 * the hike, a budget about the budget) instead of a fixed list. The server
 * answers the call on its own and shows its questions as chips; a step that
 * calls nothing else ends the turn without asking the model again.
 */

export const FOLLOW_UPS_SPEC: AiToolSpec = {
  name: ASSISTANT_FOLLOW_UPS_TOOL,
  description:
    'Offer the user up to three short questions or requests they are likely to send next, shown as one-tap chips ' +
    'under your answer. Call it once, last, together with nothing else; ordinary follow-ups come after your text. Each must ' +
    'follow from what was just discussed and the part of TREK it is about (a planned hike: an easier variant, what ' +
    'to pack; a budget: who owes whom), be written as the user would say it, in their language, and be something ' +
    'you can do. When essential trip information is missing, set question to ONE short clarification and put ' +
    'two or three likely ANSWERS in questions (not more questions). Each answer must make sense as a user ' +
    'message on its own, for example "About five days". A clarification may be the whole reply; do not repeat ' +
    'its question in text. Never repeat known information or what was just done; skip it when nothing sensible follows.',
  parameters: {
    type: 'object',
    properties: {
      questions: {
        type: 'array',
        minItems: 1,
        maxItems: MAX_FOLLOW_UPS,
        items: { type: 'string', maxLength: MAX_FOLLOW_UP_CHARS },
        description: "Short user messages, or likely answers when question is set, in the user's language.",
      },
      question: {
        type: 'string',
        minLength: 1,
        maxLength: MAX_FOLLOW_UP_QUESTION_CHARS,
        description: 'Optional single clarification above two or three answer choices; omit for ordinary follow-ups.',
      },
    },
    required: ['questions'],
    additionalProperties: false,
  },
};

/** What the server answers the call with: the model learns the chips are shown and needs to do nothing more. */
export const FOLLOW_UPS_ANSWER = 'Shown to the user as suggestions.';

/** The questions a call carries, trimmed, deduplicated and cut to what a chip holds; null when none is left. */
export function followUpsOf(args: Record<string, unknown>): AssistantFollowUps | null {
  const raw = Array.isArray(args.questions) ? args.questions : [];
  const seen = new Set<string>();
  const questions: string[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const text = item.replace(/\s+/g, ' ').trim().slice(0, MAX_FOLLOW_UP_CHARS);
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    questions.push(text);
    if (questions.length === MAX_FOLLOW_UPS) break;
  }
  if (questions.length === 0) return null;
  const question =
    typeof args.question === 'string'
      ? args.question.replace(/\s+/g, ' ').trim().slice(0, MAX_FOLLOW_UP_QUESTION_CHARS)
      : '';
  return { questions, ...(question && questions.length >= 2 ? { question } : {}) };
}
