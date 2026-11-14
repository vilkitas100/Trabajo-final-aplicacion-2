export type TopicId = 'tema-1' | 'tema-2' | 'tema-3' | 'tema-4' | 'tema-5';

export type RubricCriterionId =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j';

export type RubricLevel = 1 | 2 | 3 | 4;

export interface SubtopicExplanation {
  code: string;
  title: string;
  summary: string;
  keyConcepts: string[];
  auditFocus: string;
}

export interface AuditQuestion {
  id: string;
  topicId: TopicId;
  subtopicRef: string;
  prompt: string;
  guidance: string;
  rubricLinks: RubricCriterionId[];
  placeholder: string;
}

export interface AuditTopic {
  id: TopicId;
  number: number;
  title: string;
  shortTitle: string;
  intro: string;
  structuralDimensions: string[];
  subtopics: SubtopicExplanation[];
  questions: AuditQuestion[];
}

export interface RubricCriterion {
  id: RubricCriterionId;
  label: string;
  fullTitle: string;
  descriptors: Record<RubricLevel, string>;
}

export interface StudentProfile {
  studentName: string;
  studentId: string;
  companyName: string;
  companySector: string;
  companySize: string;
  auditDate: string;
  sigProposalSummary: string;
  techResourcesDetail: string;
  specialistBacking: string;
  collaborativeTeamNotes: string;
  teacherFeedbackApplied: string;
  apaReferences: string;
}

export interface TopicEvaluation {
  topicId: TopicId;
  evaluatedAt: string;
  source: 'gemini-ai' | 'heuristic';
  qualityScore: number; // 0 - 100
  qualityLabel: 'Excelente' | 'Satisfactorio' | 'En desarrollo' | 'Inicial';
  operationalMaturityLevel: 1 | 2 | 3 | 4 | 5;
  operationalMaturityScore: number; // 0 - 100
  operationalDiagnosis: string;
  ethicalMaturityLevel: 1 | 2 | 3 | 4 | 5;
  ethicalMaturityScore: number; // 0 - 100
  ethicalDiagnosis: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  suggestedRubricAdjustments: Partial<Record<RubricCriterionId, RubricLevel>>;
}

export interface FinalRubricEvaluation {
  evaluatedAt: string;
  source: 'gemini-ai' | 'heuristic';
  scores: Record<RubricCriterionId, RubricLevel>;
  justifications: Record<RubricCriterionId, string>;
  totalScore: number; // max 40
  executiveSummary: string;
  overallEthicalMaturity: number; // 0 - 100
  overallOperationalMaturity: number; // 0 - 100
}

export interface AuditSessionState {
  version: number;
  profile: StudentProfile;
  answers: Record<string, string>;
  topicEvaluations: Partial<Record<TopicId, TopicEvaluation>>;
  finalEvaluation: FinalRubricEvaluation | null;
  lastSavedAt: string | null;
}

export type AppView = 'overview' | 'audit' | 'report' | 'certificate';
