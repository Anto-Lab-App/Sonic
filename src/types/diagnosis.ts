// Shared type definitions for the diagnosis API response
// Used by both the API route and frontend components

export interface AudioAnalysis {
  recorded: string;
  characteristics: string;
  tags: string[];
}

export interface AiReasoningStep {
  step: string;
  detail: string;
}

export interface RecommendedAction {
  title: string;
  desc: string;
}

export interface DiagnosisParameters {
  estimated_time_hours: number;
  risk_level: string;
  complexity: string;
  obd_codes: string[];
  estimated_cost_pln: string;
}

// Previously this was the main response. Now it's the final diagnosis block.
export interface FinalDiagnosis {
  internal_reasoning_log?: string;
  title: string;
  criticality: string;
  description: string;
  confidence_score: number;
  audio_analysis: AudioAnalysis;
  ai_reasoning: AiReasoningStep[];
  recommended_actions: RecommendedAction[];
  parameters: DiagnosisParameters;
}

// For backwards compatibility in frontend, Diagnosis is aliased to FinalDiagnosis.
// However we recommend using FinalDiagnosis for clarity if needed.
export type Diagnosis = FinalDiagnosis;

export interface FollowUpRequest {
  message: string;
  action_required: string;
}

// The new unified API response from the AI
export interface AiUnifiedResponse {
  status: "follow_up" | "complete";
  follow_up_request?: FollowUpRequest;
  final_diagnosis?: FinalDiagnosis;
}

// The actual response object sent back from the Next.js API /api/diagnose
export interface DiagnoseApiResponse {
  status: "success" | "error";
  aiResponse?: AiUnifiedResponse;
  // Fallback for legacy compatibility
  diagnosis?: Diagnosis; 
  usedModel?: string;
  message?: string;
}
