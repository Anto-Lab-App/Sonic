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
}

export interface Diagnosis {
  title: string;
  criticality: string;
  description: string;
  confidence_score: number;
  audio_analysis: AudioAnalysis;
  ai_reasoning: AiReasoningStep[];
  recommended_actions: RecommendedAction[];
  parameters: DiagnosisParameters;
}

export interface DiagnoseApiResponse {
  status: "success" | "error";
  diagnosis: Diagnosis;
}
