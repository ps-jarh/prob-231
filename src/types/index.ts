export type TestResult = 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE';
export type EvidenceStatus = 'VERIFIED' | 'PENDING_REVIEW' | 'FLAGGED';

export interface Officer {
  id: string;
  officer_id: string;
  name: string;
  rank: string;
  badge_number: string;
  department: string;
  unit: string;
  station: string;
  avatar_url?: string;
}

export interface CalibrationData {
  white_balance_kelvin: number;
  illumination_lux: number;
  card_detected: boolean;
  confidence: number;
  delta_e: number;
  reaction_rgb: { r: number; g: number; b: number };
  reaction_hex: string;
  reference_hex: string;
  matrix_adjusted: boolean;
}

export interface ImageQualityMetrics {
  blur_score: number; // 0-100 (higher is sharper)
  exposure_score: number; // 0-100
  lighting_uniformity: number; // 0-100
  reference_card_detected: boolean;
  test_strip_detected: boolean;
  overall_acceptable: boolean;
  sample_classification: 'VALID_TEST_STRIP' | 'INVALID_NON_TEST_OBJECT' | 'POOR_QUALITY_STRIP';
  detected_object_type?: string;
  warnings: string[];
}

export interface AuditEvent {
  id: string;
  test_id: string;
  actor: string;
  action: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'RECORDED';
  metadata?: Record<string, any>;
  hash_snapshot?: string;
}

export interface DrugTest {
  id: string;
  test_id: string; // e.g. "FX-2026-001284"
  officer_id: string;
  officer_name: string;
  test_type: string; // e.g. "Scott Reagent (Cocaine)", "Marquis Reagent (Opiates)", "Duquenois-Levine (Cannabinoids)"
  target_substance: string;
  sample_reference: string;
  status: EvidenceStatus;
  result: TestResult;
  confidence: number; // e.g. 94.7
  timestamp: string;
  latitude: number;
  longitude: number;
  location_name: string;
  device_info: {
    device_model: string;
    os: string;
    camera_sensor: string;
    app_version: string;
  };
  original_image_url: string;
  calibrated_image_url: string;
  calibration_data: CalibrationData;
  evidence_hash: string; // SHA-256
  integrity_verified: boolean;
  verification_details: {
    officer_notes: string;
    retake_count: number;
    field_temperature: string;
    lighting_condition: string;
    signed_by: string;
    signed_at: string;
  };
  audit_trail: AuditEvent[];
  is_synced: boolean;
}

export interface TestPresetScenario {
  id: 'positive' | 'negative' | 'poor_quality';
  name: string;
  subtitle: string;
  test_type: string;
  target_substance: string;
  image_url: string;
  expected_result: TestResult;
  expected_confidence: number;
  quality: ImageQualityMetrics;
}
