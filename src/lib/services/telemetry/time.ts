type MonotonicSource = { now: () => number } | undefined;

function resolveMonotonicSource(): MonotonicSource {
  if (typeof globalThis === 'undefined') return undefined;
  const perf = (globalThis as unknown as { performance?: MonotonicSource }).performance;
  return typeof perf?.now === 'function' ? perf : undefined;
}

export function nowMonotonic(): number {
  const source = resolveMonotonicSource();
  if (source) return source.now();
  return Date.now();
}

export function nowIso(): string {
  return new Date().toISOString();
}
