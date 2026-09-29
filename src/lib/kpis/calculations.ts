export function calculateRegistrationToQrDurationMs(
  registrationStartedAt: number,
  qrGeneratedAt: number
): number {
  if (!Number.isFinite(registrationStartedAt) || !Number.isFinite(qrGeneratedAt)) return 0;
  return Math.max(0, qrGeneratedAt - registrationStartedAt);
}

export function isWithinTargetDuration(durationMs: number, targetMs: number = 2 * 60 * 1000): boolean {
  if (!Number.isFinite(durationMs) || !Number.isFinite(targetMs)) return false;
  return durationMs >= 0 && durationMs <= targetMs;
}

export function calculateQrScanEffectiveness(
  successfulScans: number,
  totalAttempts: number
): number {
  if (!Number.isFinite(successfulScans) || !Number.isFinite(totalAttempts)) return 0;
  if (totalAttempts <= 0) return 0;
  const ratio = (successfulScans / totalAttempts) * 100;
  return Math.max(0, Math.min(100, ratio));
}
