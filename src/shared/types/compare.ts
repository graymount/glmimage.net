// Types for multi-model comparison feature

export interface CompareModel {
  model: string;
  label: string;
  style: string;
  cost: number;
}

export interface CompareTask {
  id: string;
  model: string;
  modelLabel: string;
  modelStyle: string;
  provider: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  imageUrl?: string;
  error?: string;
}

export interface CompareSession {
  sessionId: string;
  prompt: string;
  tasks: CompareTask[];
  selectedTaskId?: string;
  createdAt: Date;
}

export interface CompareGenerateRequest {
  prompt: string;
  models?: string[];
}

export interface CompareGenerateResponse {
  code: number;
  message: string;
  data: {
    sessionId: string;
    tasks: CompareTask[];
    totalCost: number;
  };
}

export interface CompareQueryRequest {
  sessionId: string;
}

export interface CompareQueryResponse {
  code: number;
  message: string;
  data: {
    sessionId: string;
    allComplete: boolean;
    tasks: CompareTask[];
  };
}

// Default models for comparison (4-6 with distinct styles)
export const COMPARE_MODELS: CompareModel[] = [
  { model: 'fal-ai/flux-pro/v1.1', label: 'Flux Pro', style: 'Photorealistic', cost: 4 },
  { model: 'fal-ai/flux/dev', label: 'Flux Dev', style: 'Balanced', cost: 2 },
  { model: 'fal-ai/recraft-v3', label: 'Recraft', style: 'Design', cost: 3 },
  { model: 'fal-ai/ideogram/v2', label: 'Ideogram', style: 'Typography', cost: 3 },
];
