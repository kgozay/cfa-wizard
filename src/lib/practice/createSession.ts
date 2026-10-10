import { PracticeItem, PracticeSession, PresentedPracticeItem } from "@/types/practice";
import { makeSessionId } from "./ids";
import { createPRNG, shuffleArray } from "./random";
import { presentPracticeItem } from "./presentItem";

export interface CreateSessionOptions {
  mode: PracticeSession["mode"];
  items: PracticeItem[];
  requestedCount?: number;
  seed?: string;
  timerMode?: "timed" | "untimed";
  targetSecondsPerItem?: number;
  shuffleQuestions?: boolean;
}

/**
 * Creates a deterministic PracticeSession with stable PresentedPracticeItems.
 */
export function createPracticeSession(options: CreateSessionOptions): PracticeSession {
  const sessionId = makeSessionId();
  const seed = options.seed || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const prng = createPRNG(seed);

  let selectedItems = [...options.items];

  // Shuffle questions if requested
  if (options.shuffleQuestions !== false) {
    selectedItems = shuffleArray(selectedItems, prng);
  }

  // Honour requested count
  if (options.requestedCount && options.requestedCount > 0) {
    selectedItems = selectedItems.slice(0, options.requestedCount);
  }

  // Create presented items with remapped options using the PRNG
  const presentedItems: PresentedPracticeItem[] = selectedItems.map((item, index) => {
    return presentPracticeItem(item, sessionId, index + 1, prng);
  });

  const topicIds = Array.from(new Set(selectedItems.map((item) => item.topicId)));
  const sourceSetIds = Array.from(
    new Set(selectedItems.map((item) => item.caseId || item.id).filter(Boolean) as string[])
  );

  return {
    id: sessionId,
    mode: options.mode,
    topicIds,
    sourceSetIds,
    seed,
    itemIds: selectedItems.map((item) => item.id),
    presentedItems,
    startedAt: new Date().toISOString(),
    timerMode: options.timerMode || "timed",
    targetSecondsPerItem: options.targetSecondsPerItem ?? (options.timerMode === "timed" ? 90 : undefined),
  };
}

/**
 * Appends items to an in-progress session without disturbing the questions,
 * option order or answers already presented.
 */
export function appendItemsToSession(
  session: PracticeSession,
  items: PracticeItem[],
  extraSourceSetIds: string[] = []
): PracticeSession {
  const prng = createPRNG(`${session.seed}:append:${session.presentedItems.length}`);
  const known = new Set(session.itemIds);
  const fresh = items.filter((item) => !known.has(item.id));
  const appended = fresh.map((item, index) =>
    presentPracticeItem(item, session.id, session.presentedItems.length + index + 1, prng)
  );
  return {
    ...session,
    itemIds: [...session.itemIds, ...fresh.map((item) => item.id)],
    presentedItems: [...session.presentedItems, ...appended],
    topicIds: Array.from(new Set([...session.topicIds, ...fresh.map((item) => item.topicId)])),
    sourceSetIds: Array.from(
      new Set([
        ...session.sourceSetIds,
        ...extraSourceSetIds,
        ...(fresh.map((item) => item.caseId || item.id).filter(Boolean) as string[]),
      ])
    ),
  };
}
