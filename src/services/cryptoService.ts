/**
 * Cryptographic Service for BiOrion Evidence Integrity
 * Uses standard browser Web Crypto API (SHA-256)
 */

export async function computeSHA256(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export interface EvidencePayloadCanonical {
  test_id: string;
  officer_id: string;
  test_type: string;
  result: string;
  confidence: number;
  timestamp: string;
  latitude: number;
  longitude: number;
  device_id: string;
  image_fingerprint: string;
}

/**
 * Builds the canonical evidence string that is hashed into the SHA-256 seal.
 */
export function buildCanonicalEvidenceString(canonical: EvidencePayloadCanonical): string {
  return [
    `TEST_ID:${canonical.test_id}`,
    `OFFICER_ID:${canonical.officer_id}`,
    `TYPE:${canonical.test_type}`,
    `RESULT:${canonical.result}`,
    `CONFIDENCE:${canonical.confidence.toFixed(2)}`,
    `TIMESTAMP:${canonical.timestamp}`,
    `GEO:${canonical.latitude.toFixed(6)},${canonical.longitude.toFixed(6)}`,
    `DEVICE:${canonical.device_id}`,
    `IMAGE_FP:${canonical.image_fingerprint.slice(0, 64)}`,
  ].join('|');
}

/**
 * Generates an image fingerprint from data URL or image string.
 */
export async function computeImageFingerprint(imageData: string): Promise<string> {
  return computeSHA256(imageData.slice(0, 10000) + imageData.length);
}

/**
 * Verifies if an evidence hash matches the recomputed digest.
 */
export async function verifyEvidenceIntegrity(
  canonical: EvidencePayloadCanonical,
  expectedHash: string
): Promise<{ verified: boolean; computedHash: string; timestamp: string }> {
  const canonicalStr = buildCanonicalEvidenceString(canonical);
  const computedHash = await computeSHA256(canonicalStr);
  const verified = computedHash.toLowerCase() === expectedHash.toLowerCase();
  return {
    verified,
    computedHash,
    timestamp: new Date().toISOString(),
  };
}
