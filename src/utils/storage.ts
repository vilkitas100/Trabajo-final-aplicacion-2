import { AuditSessionState } from '../types/audit';

export const STORAGE_KEY = 'auditoria_procesos_liz_acuna_v1';

export function createEmptySession(): AuditSessionState {
  const today = new Date().toISOString().slice(0, 10);
  return {
    version: 1,
    profile: {
      studentName: '',
      studentId: '',
      companyName: '',
      companySector: '',
      companySize: 'Mediana empresa (51–250 colaboradores)',
      auditDate: today,
      sigProposalSummary: '',
      techResourcesDetail: '',
      specialistBacking: '',
      collaborativeTeamNotes: '',
      teacherFeedbackApplied: '',
      apaReferences: '',
    },
    answers: {},
    topicEvaluations: {},
    finalEvaluation: null,
    lastSavedAt: null,
  };
}

export function loadAuditSession(): AuditSessionState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptySession();
    const parsed = JSON.parse(raw) as Partial<AuditSessionState>;
    const empty = createEmptySession();
    return {
      version: 1,
      profile: {
        ...empty.profile,
        ...(parsed.profile ?? {}),
      },
      answers: parsed.answers ?? {},
      topicEvaluations: parsed.topicEvaluations ?? {},
      finalEvaluation: parsed.finalEvaluation ?? null,
      lastSavedAt: parsed.lastSavedAt ?? null,
    };
  } catch {
    return createEmptySession();
  }
}

export function saveAuditSession(state: AuditSessionState): string {
  const savedAt = new Date().toISOString();
  const payload: AuditSessionState = {
    ...state,
    lastSavedAt: savedAt,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors gracefully
  }
  return savedAt;
}

export function clearAuditSession(): AuditSessionState {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  return createEmptySession();
}
