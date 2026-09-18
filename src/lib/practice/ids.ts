/**
 * Identity generators and helpers for canonical practice models.
 */

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).slice(0, 8);
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for environments where crypto.randomUUID is not available
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function makeAuthoredSourceId(setId: string, questionId: number | string): string {
  return `authored:${setId}:${questionId}`;
}

export function makeFallbackSourceId(version: string, topicId: string, stem: string): string {
  const hash = simpleHash(stem);
  return `fallback:${version}:${topicId}:${hash}`;
}

export function makeAIDraftSourceId(requestId: string, index: number, stem: string): string {
  const hash = simpleHash(stem);
  return `ai:${requestId}:${index}:${hash}`;
}

export function makeSessionId(): string {
  return generateUUID();
}

export function makeSessionItemId(sessionId: string, displayIndex: number, sourceItemId: string): string {
  return `${sessionId}:${displayIndex}:${sourceItemId}`;
}

export function makeAttemptId(): string {
  return generateUUID();
}

export function makeTrapId(): string {
  return generateUUID();
}

export function makeLeitnerCardId(): string {
  return generateUUID();
}
